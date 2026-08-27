// src/server/routes/auth.route.ts
import { FastifyInstance } from "fastify";
import { signupController } from "@/src/server/controller/auth.controller";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post("/signup", signupController); // era /api/auth/signup
}