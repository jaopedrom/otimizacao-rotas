import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { OptimizeRouteType } from "../schemas/rotas.schema";
import { optimizeRoutes, DeliveryShipment, VehicleCapacity } from "../services/routeOptimization.service";

export async function optimizeRouteController(
    request: FastifyRequest<{ Body: OptimizeRouteType }>,
    reply: FastifyReply
) {
    try {
        const { empresaId, depositoId, entregaIds, veiculoIds } = request.body;

        // 1. Validar Empresa e Depósito
        const deposito = await prisma.tb_deposito.findFirst({
            where: { deposito_id: depositoId, dep_empresa_id: empresaId },
            include: { tb_endereco: true }
        });

        if (!deposito || !deposito.tb_endereco.end_latitude || !deposito.tb_endereco.end_longitude) {
            return reply.status(400).send({ message: "Depósito inválido ou sem coordenadas." });
        }

        const startLocation = {
            latitude: Number(deposito.tb_endereco.end_latitude),
            longitude: Number(deposito.tb_endereco.end_longitude)
        };

        // 2. Buscar Entregas (com endereços)
        const entregas = await prisma.tb_entrega.findMany({
            where: {
                entrega_id: { in: entregaIds },
                ent_empresa_id: empresaId,
                ent_status: 'PENDENTE'
            },
            include: {
                tb_endereco_tb_entrega_ent_end_idTotb_endereco: true, // Endereço de destino
                tb_entrega_item: true // Para calcular o peso
            }
        });

        if (entregas.length === 0) {
            return reply.status(400).send({ message: "Nenhuma entrega válida/pendente selecionada." });
        }

        const shipments: DeliveryShipment[] = [];
        for (const ent of entregas) {
            const end = ent.tb_endereco_tb_entrega_ent_end_idTotb_endereco;
            if (!end.end_latitude || !end.end_longitude) {
                return reply.status(400).send({ message: `A entrega ${ent.entrega_id} não tem coordenadas válidas.` });
            }

            const weight = ent.tb_entrega_item.reduce((acc: number, item: any) => acc + (Number(item.item_peso_unitario) * item.item_quantidade), 0);
            
            shipments.push({
                id: ent.entrega_id,
                location: { latitude: Number(end.end_latitude), longitude: Number(end.end_longitude) },
                weight
            });
        }

        // 3. Buscar Veículos
        let whereVeiculo: any = {
            vei_empresa_id: empresaId,
            vei_dep_id: depositoId,
            vei_ativo: true
        };
        
        if (veiculoIds && veiculoIds.length > 0) {
            whereVeiculo.vei_id = { in: veiculoIds };
        }

        const veiculosDb = await prisma.tb_veiculo.findMany({ where: whereVeiculo });

        if (veiculosDb.length === 0) {
            return reply.status(400).send({ message: "Nenhum veículo disponível selecionado/encontrado." });
        }

        const vehicles: VehicleCapacity[] = veiculosDb.map((v: any) => ({
            id: v.vei_id,
            maxWeight: v.vei_capacidade || 1000000, // Se não tiver capacidade, assumimos infinito/grande número
            startLocation
        }));

        // 4. Chamar Google API
        const optimizationResult = await optimizeRoutes(shipments, vehicles);

        if (optimizationResult.routes.length === 0) {
            return reply.status(400).send({ message: "Não foi possível gerar rotas viáveis. Talvez a carga exceda a capacidade." });
        }

        // 5. Persistir no Banco de Dados
        const rotasCriadas: any[] = [];

        await prisma.$transaction(async (tx: any) => {
            for (const route of optimizationResult.routes) {
                // Se o veiculo não teve paradas (foi ignorado pela API pois outros deram conta), pulamos
                if (route.stops.length === 0) continue;

                // Cria a tb_rota
                const novaRota = await tx.tb_rota.create({
                    data: {
                        rota_empresa_id: empresaId,
                        rota_status: 'PLANEJADA',
                        rota_distancia_total: route.totalDistanceMeters,
                        rota_duracao_total: route.totalDurationSeconds,
                        rota_maps_url: route.mapsUrl || null
                    }
                });

                // Cria as paradas
                for (const stop of route.stops) {
                    await tx.tb_parada.create({
                        data: {
                            parada_rota_id: novaRota.rota_id,
                            parada_vei_id: route.vehicleId,
                            parada_entrega_id: stop.deliveryId,
                            parada_sequencia: stop.sequence,
                            parada_status: 'PENDENTE'
                        }
                    });

                    // Atualiza status da entrega
                    await tx.tb_entrega.update({
                        where: { entrega_id: stop.deliveryId },
                        data: { ent_status: 'EM_ROTA' }
                    });
                }
                
                rotasCriadas.push(novaRota);
            }
        });

        return reply.status(200).send({ 
            success: true, 
            message: "Rotas otimizadas com sucesso", 
            rotasGeradas: rotasCriadas.length,
            detalhes: optimizationResult
        });

    } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ message: "Erro ao otimizar rotas: " + error.message });
    }
}
