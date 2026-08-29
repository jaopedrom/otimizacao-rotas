import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

export default fp(async function authPlugin(fastify: FastifyInstance) {
    fastify.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            return reply.status(401).send({ success: false, message: "Não autenticado" });
        }
    });
});