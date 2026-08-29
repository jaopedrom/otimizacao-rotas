import { FastifyInstance } from "fastify";
import { loginController } from "@/src/server/controller/login.controller";

export async function loginRoutes(fastify: FastifyInstance) {
    fastify.post("/login", loginController);
}