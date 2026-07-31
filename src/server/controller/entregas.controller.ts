import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { createLoteEntregasSchema } from "../schemas/entregas.schema";

type CreateLoteType = z.infer<typeof createLoteEntregasSchema>;

export async function criarEntregasLoteController(
    request: FastifyRequest<{ Body: CreateLoteType }>,
    reply: FastifyReply
) {
    try {
        const { entregas } = request.body;
        
        // Pega uma empresa e o endereço postal default para testes/mock já que não temos auth finalizada
        const empresa = await prisma.tb_empresa.findFirst();
        if (!empresa) {
            return reply.status(400).send({ success: false, message: "Nenhuma empresa encontrada no sistema.", count: 0 });
        }

        const enderecoPostal = await prisma.tb_endereco_postal.findFirst();
        if (!enderecoPostal) {
             return reply.status(400).send({ success: false, message: "Nenhum endereço postal base encontrado no sistema.", count: 0 });
        }

        // Pega um depósito para ser o pickup default
        const deposito = await prisma.tb_deposito.findFirst({ where: { dep_empresa_id: empresa.empresa_id } });
        if (!deposito) {
             return reply.status(400).send({ success: false, message: "Nenhum depósito encontrado para a empresa.", count: 0 });
        }

        // Usando transaction para garantir que tudo seja salvo ou revertido
        const resultados = await prisma.$transaction(async (tx: any) => {
            const entregasCriadas = [];
            
            for (const item of entregas) {
                // 1. Criar o Endereço de destino
                const enderecoDestino = await tx.tb_endereco.create({
                    data: {
                        endereco_digitado: item.enderecoDigitado,
                        end_latitude: item.lat,
                        end_longitude: item.lng,
                        end_endp_id: enderecoPostal.endp_id, // mock necessário pelo schema atual
                    }
                });

                // Nota: O cálculo do peso total da entrega deve SEMPRE ser feito no backend (aqui)
                // para garantir que os dados não foram manipulados no frontend.
                const pesoTotal = item.produtos.reduce((acc, prod) => {
                    return acc + (prod.quantidade * prod.peso_unitario);
                }, 0);

                // 2. Criar a Entrega
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

                // 3. Criar os Itens da Entrega (Sacas/Produtos)
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
                
                entregasCriadas.push(entrega);
            }
            return entregasCriadas;
        });

        return reply.status(201).send({ 
            success: true, 
            message: "Entregas criadas com sucesso", 
            count: resultados.length 
        });

    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ success: false, message: "Erro interno ao criar entregas.", count: 0 });
    }
}
