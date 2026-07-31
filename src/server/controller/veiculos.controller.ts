import { FastifyReply, FastifyRequest } from "fastify";
import { listarVeiculosService } from "../services/veiculos.service";

export async function listarVeiculosController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const veiculos = await listarVeiculosService();
        return reply.status(200).send(veiculos);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "Erro ao buscar veículos" });
    }
}
