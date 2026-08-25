import { z } from "zod";

export const createClienteSchema = z.object({
    nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    telefone: z.string().optional(),
    cep: z.string().regex(/^\d{8}$/, "CEP deve conter exatamente 8 números"),
    logradouro: z.string().min(2, "Rua é obrigatória"),
    bairro: z.string().min(2, "Bairro é obrigatório"),
    cidade: z.string().min(2, "Cidade é obrigatória"),
    estado: z.string().length(2, "Estado deve ser a UF"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
});

export type CreateClienteType = z.infer<typeof createClienteSchema>;
