import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { createLoteEntregasSchema } from "../schemas/entregas.schema";
import { listarVeiculosService } from "../services/veiculos.service";
import { optimizeRoutes, DeliveryShipment, VehicleCapacity } from "../services/routeOptimization.service";

type CreateLoteType = z.infer<typeof createLoteEntregasSchema>;

export async function criarEntregasLoteController(
    request: FastifyRequest<{ Body: CreateLoteType }>,
    reply: FastifyReply
) {
    try {
        const { entregas, veiculosIds, depositoId } = request.body;
        
        // Pega uma empresa e o endereço postal default para testes/mock já que não temos auth finalizada
        const empresa = await prisma.tb_empresa.findFirst();
        if (!empresa) {
            return reply.status(400).send({ success: false, message: "Nenhuma empresa encontrada no sistema.", count: 0 });
        }

        const enderecoPostal = await prisma.tb_endereco_postal.findFirst();
        if (!enderecoPostal) {
             return reply.status(400).send({ success: false, message: "Nenhum endereço postal base encontrado no sistema.", count: 0 });
        }

        // Pega o depósito selecionado na interface
        const deposito = await prisma.tb_deposito.findUnique({ 
            where: { deposito_id: depositoId },
            include: { tb_endereco: true } // Precisamos das coordenadas do depósito
        });
        if (!deposito || !deposito.tb_endereco) {
             return reply.status(400).send({ success: false, message: "Nenhum depósito ou endereço de depósito encontrado para a empresa.", count: 0 });
        }

        const depositoLat = Number(deposito.tb_endereco.end_latitude);
        const depositoLng = Number(deposito.tb_endereco.end_longitude);

        if (!depositoLat || !depositoLng) {
            return reply.status(400).send({ success: false, message: "O depósito não possui coordenadas geográficas válidas.", count: 0 });
        }

        // 1. Validar e buscar os veículos selecionados e suas capacidades reais
        const todosVeiculos = await listarVeiculosService();
        const veiculosSelecionados = todosVeiculos.filter(v => veiculosIds.includes(v.veiculo_id) && v.disponivel);

        if (veiculosSelecionados.length === 0) {
            return reply.status(400).send({ success: false, message: "Nenhum veículo válido ou disponível foi selecionado.", count: 0 });
        }

        const optimizationVehicles: VehicleCapacity[] = veiculosSelecionados.map(v => ({
            id: v.veiculo_id,
            maxWeight: (v.veiculo_capacidade || 0) - (v.carga_atual || 0),
            startLocation: { latitude: depositoLat, longitude: depositoLng }
        }));

        // 2. Salvar as Entregas inicialmente no banco
        const optimizationDeliveries: DeliveryShipment[] = [];
        
        const entregasCriadas = await prisma.$transaction(async (tx: any) => {
            const criadas = [];
            
            for (const item of entregas) {
                const cliente = await tx.tb_usuario.findUnique({
                    where: { usr_id: item.clienteId },
                    include: { tb_endereco_tb_usuario_usr_end_idTotb_endereco: true }
                });

                if (!cliente || !cliente.usr_end_id || !cliente.tb_endereco_tb_usuario_usr_end_idTotb_endereco) {
                    throw new Error(`Cliente não possui endereço cadastrado. ID: ${item.clienteId}`);
                }
                
                const enderecoDestino = cliente.tb_endereco_tb_usuario_usr_end_idTotb_endereco;

                const pesoTotal = item.produtos.reduce((acc, prod) => {
                    return acc + (prod.quantidade * prod.peso_unitario);
                }, 0);

                const entrega = await tx.tb_entrega.create({
                    data: {
                        ent_empresa_id: empresa.empresa_id,
                        ent_user_id: item.clienteId,
                        ent_pickup_end_id: deposito.dep_end_id,
                        ent_end_id: enderecoDestino.end_id,
                        ent_peso_total: pesoTotal,
                        ent_status: 'PENDENTE'
                    }
                });

                for (const prod of item.produtos) {
                    await tx.tb_entrega_item.create({
                        data: {
                            item_entrega_id: entrega.entrega_id,
                            item_quantidade: prod.quantidade,
                            item_peso_unitario: prod.peso_unitario,
                            item_descricao: prod.descricao || null,
                        }
                    });
                }
                
                criadas.push(entrega);

                if (enderecoDestino.end_latitude && enderecoDestino.end_longitude) {
                        optimizationDeliveries.push({
                            id: entrega.entrega_id,
                            weight: pesoTotal,
                            location: { latitude: Number(enderecoDestino.end_latitude), longitude: Number(enderecoDestino.end_longitude) }
                        });
                }
            }
            return criadas;
        });

        // 3. Chamar a API de Otimização de Rotas do Google
        let optimizationResponse;
        try {
            optimizationResponse = await optimizeRoutes(optimizationDeliveries, optimizationVehicles);
        } catch (error) {
            request.log.error(error, "Erro na API do Google Maps Optimization");
            // Se falhar, as entregas já estão salvas como PENDENTE no banco. Retornamos sucesso parcial.
            return reply.status(201).send({ 
                success: true, 
                message: "Entregas salvas, mas houve falha na otimização de rotas com a API do Google.", 
                count: entregasCriadas.length 
            });
        }

        // 4. Processar a Resposta e Salvar as Rotas e Paradas
        const rotasCriadas = [];
        if (optimizationResponse && optimizationResponse.routes) {
            for (const route of optimizationResponse.routes) {
                if (route.stops.length === 0) continue;

                // Cria a rota
                const novaRota = await prisma.tb_rota.create({
                    data: {
                        rota_empresa_id: empresa.empresa_id,
                        rota_status: 'PLANEJADA',
                        rota_maps_url: route.mapsUrl || null,
                        rota_distancia_total: route.totalDistanceMeters,
                        rota_duracao_total: route.totalDurationSeconds
                    }
                });

                // Cria as paradas (visits)
                for (const stop of route.stops) {
                    await prisma.tb_parada.create({
                        data: {
                            parada_rota_id: novaRota.rota_id,
                            parada_vei_id: route.vehicleId,
                            parada_entrega_id: stop.deliveryId,
                            parada_sequencia: stop.sequence,
                            parada_status: 'PENDENTE'
                        }
                    });
                    
                    // Atualiza status da entrega
                    await prisma.tb_entrega.update({
                        where: { entrega_id: stop.deliveryId },
                        data: { ent_status: 'EM_ROTA' }
                    });
                }
                rotasCriadas.push(novaRota);
            }
        }

        return reply.status(201).send({ 
            success: true, 
            message: "Entregas criadas e rotas otimizadas com sucesso!", 
            count: entregasCriadas.length 
        });

    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ success: false, message: "Erro interno ao criar entregas.", count: 0 });
    }
}

export async function listarEmAndamentoController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const rotas = await prisma.tb_rota.findMany({
            where: {
                rota_status: { in: ['PLANEJADA', 'EM_ANDAMENTO'] }
            },
            include: {
                tb_parada: {
                    include: {
                        tb_veiculo: true,
                        tb_entrega: {
                            include: {
                                tb_usuario_tb_entrega_ent_user_idTotb_usuario: true
                            }
                        }
                    }
                }
            },
            orderBy: { dt_criacao: 'desc' }
        });

        // Formatar para a tela
        const resultado = rotas.map(rota => {
            const paradas = rota.tb_parada;
            const veiculo = paradas.length > 0 ? paradas[0].tb_veiculo : null;
            
            const pesoTotal = paradas.reduce((acc, p) => acc + Number(p.tb_entrega?.ent_peso_total || 0), 0);
            const clientes = paradas.map(p => p.tb_entrega?.tb_usuario_tb_entrega_ent_user_idTotb_usuario?.usr_nome).filter(Boolean).join(', ');

            return {
                id: rota.rota_id,
                status: rota.rota_status,
                mapsUrl: rota.rota_maps_url,
                distancia: rota.rota_distancia_total,
                duracao: rota.rota_duracao_total,
                veiculo: veiculo ? {
                    id: veiculo.vei_id,
                    nome: veiculo.vei_nome,
                    placa: veiculo.vei_placa
                } : null,
                pesoTotal,
                qtdEntregas: paradas.length,
                clientesResumo: clientes.length > 30 ? clientes.substring(0, 30) + '...' : clientes
            };
        }).filter(r => r.veiculo !== null); // Ignora rotas sem veículo válido

        return reply.status(200).send(resultado);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "Erro ao listar entregas em andamento" });
    }
}

export async function finalizarRotaController(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const { id } = request.params;

        const rota = await prisma.tb_rota.findUnique({
            where: { rota_id: id },
            include: { tb_parada: true }
        });

        if (!rota) {
            return reply.status(404).send({ success: false, message: "Rota não encontrada" });
        }

        const entregaIds = rota.tb_parada.map(p => p.parada_entrega_id);
        const paradaIds = rota.tb_parada.map(p => p.parada_id);

        await prisma.$transaction(async (tx: any) => {
            // Atualiza a Rota
            await tx.tb_rota.update({
                where: { rota_id: id },
                data: { rota_status: 'CONCLUIDA' }
            });

            // Atualiza as Paradas
            if (paradaIds.length > 0) {
                await tx.tb_parada.updateMany({
                    where: { parada_id: { in: paradaIds } },
                    data: { parada_status: 'ENTREGUE' }
                });
            }

            // Atualiza as Entregas
            if (entregaIds.length > 0) {
                await tx.tb_entrega.updateMany({
                    where: { entrega_id: { in: entregaIds } },
                    data: { ent_status: 'ENTREGUE' }
                });
            }
        });

        return reply.status(200).send({ success: true, message: "Rota e entregas finalizadas com sucesso. O veículo foi liberado!" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ success: false, message: "Erro interno ao finalizar rota" });
    }
}
