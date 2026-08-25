import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";

export async function listarClientesController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const clientes = await prisma.tb_usuario.findMany({
            where: {
                usr_cargo: 'CLIENTE',
            },
            select: {
                usr_id: true,
                usr_nome: true,
                usr_email: true,
                tb_endereco_tb_usuario_usr_end_idTotb_endereco: {
                    select: {
                        endereco_digitado: true,
                        end_latitude: true,
                        end_longitude: true
                    }
                }
            },
            orderBy: {
                usr_nome: 'asc',
            }
        });

        const clientesMapeados = clientes.map(c => ({
            usr_id: c.usr_id,
            usr_nome: c.usr_nome,
            usr_email: c.usr_email,
            endereco_digitado: c.tb_endereco_tb_usuario_usr_end_idTotb_endereco?.endereco_digitado || null,
            lat: c.tb_endereco_tb_usuario_usr_end_idTotb_endereco?.end_latitude ? Number(c.tb_endereco_tb_usuario_usr_end_idTotb_endereco.end_latitude) : null,
            lng: c.tb_endereco_tb_usuario_usr_end_idTotb_endereco?.end_longitude ? Number(c.tb_endereco_tb_usuario_usr_end_idTotb_endereco.end_longitude) : null,
        }));

        return reply.status(200).send(clientesMapeados);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "Erro ao buscar clientes" });
    }
}
