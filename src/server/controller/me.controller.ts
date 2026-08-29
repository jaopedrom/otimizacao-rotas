import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/src/lib/prisma";

export async function meController(request: FastifyRequest, reply: FastifyReply) {
    const usuario = await prisma.tb_usuario.findUnique({
        where: { usr_id: request.user.sub },
        select: {
            usr_id: true,
            usr_nome: true,
            usr_email: true,
            usr_cargo: true,
            usr_emp_id: true,
        },
    });

    if (!usuario) {
        return reply.status(401).send({ success: false, message: "Não autenticado" });
    }

    return reply.status(200).send({ success: true, usuario });
}