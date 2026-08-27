import {z} from "zod";
import { tipo_usr } from "@/src/generated/prisma/enums";

export const createUsuarioSchema = z.object({
    nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    cpf: z.string().transform((cpf) => cpf.replace(/\D/g, '')).pipe(z.string().length(11, 'CPF deve conter 11 numeros').regex(/^\d+$/, 'O CPF deve conter apenas numeros.')),
    cargo: z.nativeEnum(tipo_usr, {
        message: "O cargo é obrigatório",
    }),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().optional(),
    senha: z.string().min(8, "A senha é obrigatória"),
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

export type CreateUsuarioType = z.infer<typeof createUsuarioSchema>;
