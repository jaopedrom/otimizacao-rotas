import { FastifyInstance } from "fastify";
import { criarDepositoController, listarDepositosController } from "../controller/depositos.controller";

export async function depositosRoutes(fastify: FastifyInstance) {
    fastify.post('/depositos', criarDepositoController);
    fastify.get('/depositos', listarDepositosController);
}
