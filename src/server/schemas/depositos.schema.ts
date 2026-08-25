import { z } from "zod";

export const createDepositoSchema = z.object({
    empresa_nome: z.string().min(2, "Nome da empresa deve ter no mínimo 2 caracteres"),
    dep_nome: z.string().min(2, "Nome do depósito deve ter no mínimo 2 caracteres"),
    cep: z.string().regex(/^\d{8}$/, "CEP deve conter exatamente 8 números (somente números)"),
    logradouro: z.string().min(2, "Rua/Logradouro é obrigatório"),
    bairro: z.string().min(2, "Bairro é obrigatório"),
    cidade: z.string().min(2, "Cidade é obrigatória"),
    estado: z.string().length(2, "Estado deve ser a UF (2 caracteres)"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
});

export type CreateDepositoType = z.infer<typeof createDepositoSchema>;
