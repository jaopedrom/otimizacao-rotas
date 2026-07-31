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
            },
            orderBy: {
                usr_nome: 'asc',
            }
        });

        return reply.status(200).send(clientes);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "Erro ao buscar clientes" });
    }
}
