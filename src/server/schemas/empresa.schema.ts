// src/server/schemas/empresa.schema.ts
import { z } from "zod";
import { enderecoComCoordenadasSchema } from "@/src/server/schemas/endereco-schema";

export const createEmpresaSchema = z.object({
    nome_fantasia: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    razao_social: z.string().min(2, "Razão social deve ter no mínimo 2 caracteres"),
    cnpj: z
        .string()
        .transform((val) => val.replace(/\D/g, ""))
        .pipe(z.string().regex(/^\d{14}$/, "CNPJ deve conter exatamente 14 números")),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    telefone: z.string().optional(),
    endereco: enderecoComCoordenadasSchema,
});
export type CreateEmpresaType = z.infer<typeof createEmpresaSchema>;

export const empresaResponseSchema = z.array(
    z.object({
        empresa_id: z.string().uuid(),
        emp_nome: z.string(),
        emp_razao_soc: z.string(),
        emp_cnpj: z.string(),
        emp_email: z.string().email().nullable().optional(),
        endereco_digitado: z.string().nullable().optional(),
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
    })
);
export type Empresa = z.infer<typeof empresaResponseSchema>[number];