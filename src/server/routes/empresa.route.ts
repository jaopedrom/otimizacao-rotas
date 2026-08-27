// src/routes/empresa.routes.ts
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "@fastify/type-provider-zod";
import { criarEmpresaController } from "@/src/server/controller/empresa.controller";
import { createEmpresaSchema } from "../schemas/empresa.schema";

export async function empresaRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/empresas",
        {
            schema: { body: createEmpresaSchema },
        },
        criarEmpresaController
    );
}