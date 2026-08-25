import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { criarEntregasLoteController, listarEmAndamentoController, finalizarRotaController } from "../controller/entregas.controller";
import { createLoteEntregasSchema, createLoteEntregasResponseSchema, finalizarRotaParamsSchema, finalizarRotaResponseSchema } from "../schemas/entregas.schema";

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

    fastify.withTypeProvider<ZodTypeProvider>().get(
        "/entregas/em-andamento",
        listarEmAndamentoController
    );

    fastify.withTypeProvider<ZodTypeProvider>().patch(
        "/entregas/:id/finalizar",
        {
            schema: {
                params: finalizarRotaParamsSchema,
                response: {
                    200: finalizarRotaResponseSchema,
                },
            },
        },
        finalizarRotaController
    );
}
