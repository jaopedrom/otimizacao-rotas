// src/server/schemas/auth.schema.ts
import { z } from "zod";
import { enderecoComCoordenadasSchema } from "@/src/server/schemas/endereco-schema";

const telefoneSchema = z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 10 || val.length === 11, "Telefone deve conter DDD + número (10 ou 11 dígitos)");

const empresaSchema = z.object({
    emp_razao_soc: z.string().min(2, "Razão social deve ter no mínimo 2 caracteres"),
    emp_nome: z.string().min(2, "Nome fantasia deve ter no mínimo 2 caracteres"),
    emp_cnpj: z
        .string()
        .transform((val) => val.replace(/\D/g, ""))
        .pipe(z.string().regex(/^\d{14}$/, "CNPJ deve conter exatamente 14 números")),
    emp_email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    emp_telefone: telefoneSchema,
    endereco: enderecoComCoordenadasSchema,
});

const usuarioSchema = z
    .object({
        usr_nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
        usr_cpf: z
            .string()
            .transform((cpf) => cpf.replace(/\D/g, ""))
            .pipe(z.string().length(11, "CPF deve conter 11 números").regex(/^\d+$/, "O CPF deve conter apenas números")),
        usr_email: z.string().email("E-mail inválido"),
        usr_telefone: telefoneSchema,
        usr_dt_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
        usr_password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
        usr_password_confirm: z.string(),
        endereco: enderecoComCoordenadasSchema,
    })
    .refine((data) => data.usr_password === data.usr_password_confirm, {
        message: "As senhas não coincidem",
        path: ["usr_password_confirm"],
    });

export const signupSchema = z.object({
    empresa: empresaSchema,
    usuario: usuarioSchema,
});

export type Signup = z.infer<typeof signupSchema>;