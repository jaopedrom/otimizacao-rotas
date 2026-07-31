import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { optimizeRouteSchema } from "../schemas/rotas.schema";
import { optimizeRouteController } from "../controller/rotas.controller";
import { z } from "zod";

export async function rotasRoutes(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().post(
        "/rotas/otimizar",
        {
            schema: {
                body: optimizeRouteSchema,
                response: {
                    200: z.any(),
                    400: z.object({ message: z.string() }),
                    500: z.object({ message: z.string() })
                }
            }
        },
        optimizeRouteController
    );
}
