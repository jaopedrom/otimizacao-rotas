import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { criarEntregasLoteController } from "../controller/entregas.controller";
import { createLoteEntregasSchema, createLoteEntregasResponseSchema } from "../schemas/entregas.schema";

export async function entregasRoutes(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().post(
        "/entregas/lote",
        {
            schema: {
                body: createLoteEntregasSchema,
                response: {
                    201: createLoteEntregasResponseSchema,
                },
            },
        },
        criarEntregasLoteController
    );
}
