// src/server/routes/geocoding.routes.ts
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { searchAddressController } from "../controller/geocoding.controller";
import { geocodeQuerySchema, geocodeResponseSchema } from "../schemas/geocoding.schema";
import { z } from "zod";

export async function geocodingRoutes(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().get(
        "/geocoding/search",
        {
            schema: {
                querystring: geocodeQuerySchema,
                response: {
                    200: geocodeResponseSchema,
                    404: z.object({ message: z.string() }),
                },
            },
        },
        searchAddressController
    );
}