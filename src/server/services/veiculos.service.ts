import { prisma } from "../../lib/prisma";
import {createVeiculoInput, Veiculo} from "../schemas/veiculos.schema";
import {FastifyReply, FastifyRequest} from "fastify";
import {createClienteSchema} from "@/src/server/schemas/clientes.schema";

export async function cadastrarVeiculoService(
    request: FastifyRequest<{ Body: createVeiculoInput }>,
    reply: FastifyReply
) {
    try {
        const data = createClienteSchema.parse(request.body);
    }
}

export async function listarVeiculosService(): Promise<Veiculo[]> {
    const veiculosDb = await prisma.tb_veiculo.findMany({
        where: { vei_ativo: true },
        select: {
            vei_id: true,
            vei_nome: true,
            vei_placa: true,
            vei_capacidade: true,
            tb_parada: {
                select: {
                    parada_status: true,
                    tb_rota: {
                        select: {
                            rota_status: true,
                        }
                    },
                    tb_entrega: {
                        select: {
                            ent_peso_total: true,
                            ent_status: true,
                        }
                    }
                }
            }
        },
        orderBy: { vei_nome: 'asc' }
    });

    return veiculosDb.map(v => {
        let disponivel = true;
        let carga_atual = 0;
        const capacidade = v.vei_capacidade ?? 0;

        for (const parada of v.tb_parada) {
            // Se houver uma rota em andamento para este veículo, ele está indisponível
            if (parada.tb_rota?.rota_status === 'EM_ANDAMENTO') {
                disponivel = false;
                break;
            }

            // Se for uma parada pendente com rota planejada e entrega pendente
            if (parada.parada_status === 'PENDENTE' && parada.tb_entrega?.ent_status === 'PENDENTE') {
                carga_atual += Number(parada.tb_entrega.ent_peso_total || 0);
            }
        }

        if (disponivel && (capacidade - carga_atual) <= 0) {
            disponivel = false;
        }

        return {
            veiculo_id: v.vei_id,
            veiculo_nome: v.vei_nome,
            veiculo_placa: v.vei_placa,
            veiculo_capacidade: capacidade,
            carga_atual: carga_atual,
            disponivel: disponivel,
        };
    });
}
