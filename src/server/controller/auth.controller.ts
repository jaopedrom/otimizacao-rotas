// src/server/controller/auth.controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { signupSchema } from "@/src/server/schemas/auth.schema";
import signupEmpresaComOperador, { CadastroDuplicadoError } from "@/src/server/services/auth.service";

export async function signupController(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = signupSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send({
            success: false,
            message: "Dados inválidos",
            errors: parseResult.error.flatten(),
        });
    }

    try {
        const resultado = await signupEmpresaComOperador(parseResult.data);
        return reply.status(201).send({ success: true, ...resultado });
    } catch (error) {
        if (error instanceof CadastroDuplicadoError) {
            return reply.status(409).send({ success: false, message: error.message });
        }
        request.log.error(error);
        return reply.status(500).send({ success: false, message: "Erro ao cadastrar empresa" });
    }
}