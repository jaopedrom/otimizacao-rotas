import "@fastify/jwt";
import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        payload: { sub: string; usr_emp_id: string; usr_cargo: string };
        user: { sub: string; usr_emp_id: string; usr_cargo: string };
    }
}