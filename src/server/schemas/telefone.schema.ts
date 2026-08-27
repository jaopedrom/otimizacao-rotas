// src/server/schemas/telefone.schema.ts
import { z } from "zod";

export const telefoneSchema = z
    .string()
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 10 || val.length === 11, "Telefone deve conter DDD + número (10 ou 11 dígitos)");