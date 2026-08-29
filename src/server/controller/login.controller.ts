import { FastifyRequest, FastifyReply } from "fastify";
import { loginSchema } from "@/src/server/schemas/login.schema";
import { autenticarUsuario, CredenciaisInvalidasError } from "@/src/server/services/login.service";

export async function loginController(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            success: false,
            message: "Dados inválidos",
            errors: parseResult.error.flatten(),
        });
    }

    try {
        const { usuario, payload } = await autenticarUsuario(parseResult.data);

        const token = await reply.jwtSign(payload, { expiresIn: "7d" });

        reply.setCookie("session_token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 dias
        });

        return reply.status(200).send({ success: true, usuario });
    } catch (error) {
        if (error instanceof CredenciaisInvalidasError) {
            return reply.status(401).send({ success: false, message: error.message });
        }
        request.log.error(error);
        return reply.status(500).send({ success: false, message: "Erro ao autenticar" });
    }
}