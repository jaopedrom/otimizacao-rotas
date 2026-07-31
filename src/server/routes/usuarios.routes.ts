import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { listarClientesController } from "../controller/usuarios.controller";
import { clienteResponseSchema } from "../schemas/usuarios.schema";

export async function usuariosRoutes(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().get(
        "/clientes",
        {
            schema: {
                response: {
                    200: clienteResponseSchema,
                },
            },
        },
        listarClientesController
    );
}
