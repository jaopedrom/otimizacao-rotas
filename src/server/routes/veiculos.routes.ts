import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { listarVeiculosController } from "../controller/veiculos.controller";
import { veiculoResponseSchema } from "../schemas/veiculos.schema";

export async function veiculosRoutes(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().get(
        "/veiculos",
        {
            schema: {
                response: {
                    200: veiculoResponseSchema,
                },
            },
        },
        listarVeiculosController
    );
}
