// src/controllers/empresa.controller.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { createEmpresaSchema, CreateEmpresaType } from "@/src/server/schemas/empresa.schema";
import { z } from "zod";
import { criarEmpresaService } from "@/src/server/services/empresa.service"; // Chama o Chef!

export async function criarEmpresaController(
    req: FastifyRequest<{ Body: CreateEmpresaType }>,
    reply: FastifyReply,
) {
    try {
        //coleta a req
        const data = createEmpresaSchema.parse(req.body);

        //envia para o service
        const empresaCriada = await criarEmpresaService(data);

        //retorno do service
        return reply.status(201).send({ success: true, data: empresaCriada });

    } catch (error: any) {
        req.log.error(error);

        if (error instanceof z.ZodError) {
            return reply.status(400).send({ success: false, message: "Dados inválidos", errors: error.issues });
        }

        //cnpj ja existente
        if (error.message === "Este CNPJ já está cadastrado no sistema.") {
            return reply.status(409).send({ success: false, message: error.message });
        }

        return reply.status(500).send({ success: false, message: "Erro interno ao criar empresa" });
    }
}