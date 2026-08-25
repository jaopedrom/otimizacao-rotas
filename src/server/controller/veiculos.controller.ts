import { FastifyReply, FastifyRequest } from "fastify";
import {cadastrarVeiculoService, listarVeiculosService} from "../services/veiculos.service";

export async function cadastrarVeiculos(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const cadVeiculo = await cadastrarVeiculoService();
        return reply.status(200).send({veiculo: request.body});
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({postMessage: "Erro ao cadastrar o veiculo"});
    }
}

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
