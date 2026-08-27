import { FastifyInstance } from "fastify";
import { signupController} from "@/src/server/controller/auth.controller";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post("/api/auth/signup", signupController);
}