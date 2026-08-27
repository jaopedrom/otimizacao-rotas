// src/server/schemas/usuario.schema.ts
import { z } from "zod";
import { tipo_usr } from "@/src/generated/prisma/enums";
import { enderecoComCoordenadasSchema } from "@/src/server/schemas/endereco-schema";

export const createUsuarioSchema = z.object({
    nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    cpf: z
        .string()
        .transform((cpf) => cpf.replace(/\D/g, ''))
        .pipe(z.string().length(11, 'CPF deve conter 11 numeros').regex(/^\d+$/, 'O CPF deve conter apenas numeros.')),
    cargo: z.nativeEnum(tipo_usr, { message: "O cargo é obrigatório" }),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().optional(),
    senha: z.string().min(8, "A senha é obrigatória"),
    endereco: enderecoComCoordenadasSchema,
});
export type CreateUsuarioType = z.infer<typeof createUsuarioSchema>;