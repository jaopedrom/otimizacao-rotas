import { FastifyInstance } from "fastify";
import { meController } from "@/src/server/controller/me.controller";

export async function meRoutes(fastify: FastifyInstance) {
    fastify.get("/me", { onRequest: [fastify.authenticate] }, meController);
}