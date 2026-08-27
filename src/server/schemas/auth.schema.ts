import { z } from "zod";
import { enderecoBaseSchema } from "@/src/server/schemas/endereco-schema";

export const empresaSignupSchema = z.object({
    emp_nome: z.string().min(1, "Nome é obrigatório").max(100),
    emp_razao_soc: z.string().min(1, "Razão social é obrigatória").max(100),
    emp_cnpj: z
        .string()
        .transform((val) => val.replace(/\D/g, ""))
        .refine((val) => val.length === 14, "CNPJ deve conter 14 dígitos"),
    emp_email: z.string().email("Email inválido").max(100),
    emp_telefone: z
        .string()
        .transform((val) => val.replace(/\D/g, ""))
        .refine((val) => val.length >= 10 && val.length <= 11, "Telefone inválido"),
    endereco: enderecoBaseSchema,
});

export const usuarioSignupSchema = z.object({
    usr_nome: z.string().min(1, "Nome é obrigatório").max(255),
    usr_email: z.string().email("Email inválido").max(255),
    usr_password: z
        .string()
        .min(8, "Senha deve ter no mínimo 8 caracteres")
        .max(72, "Senha muito longa"),
    usr_password_confirm: z.string(),
    usr_dt_nascimento: z.coerce.date({
        errorMap: () => ({ message: "Data de nascimento inválida" }),
    }).optional(),
    endereco: enderecoBaseSchema,
}).refine((data) => data.usr_password === data.usr_password_confirm, {
    message: "As senhas não coincidem",
    path: ["usr_password_confirm"],
});

export const signupSchema = z.object({
    empresa: empresaSignupSchema,
    usuario: usuarioSignupSchema,
});

export type EmpresaSignupInput = z.input<typeof empresaSignupSchema>;
export type SignupInput = z.input<typeof signupSchema>;
export type Signup = z.output<typeof signupSchema>;