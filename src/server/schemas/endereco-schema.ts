// src/server/schemas/endereco-schema.ts
import { z } from "zod";

export const enderecoBaseSchema = z.object({
    cep: z
        .string()
        .transform((val) => val.replace(/\D/g, ""))
        .refine((val) => val.length === 8, "CEP deve conter 8 dígitos"),
    logradouro: z.string().min(1, "Logradouro é obrigatório").max(255),
    bairro: z.string().min(1, "Bairro é obrigatório").max(100),
    cidade: z.string().min(1, "Cidade é obrigatória").max(45),
    estado: z.string().length(2, "UF deve ter 2 letras"),
    numero: z.string().min(1, "Número é obrigatório").max(20),
    complemento: z.string().max(255).optional(),
    apelido: z.string().max(50).optional(),
});

export const enderecoSchema = enderecoBaseSchema.extend({
    lat: z.number({ message: "Latitude é obrigatória" }),
    lng: z.number({ message: "Longitude é obrigatória" }),
});

// usado no cadastro inicial: coordenadas ainda não vêm do geocoding nesse form
export const enderecoComCoordenadasSchema = enderecoBaseSchema.extend({
    lat: z.number().optional(),
    lng: z.number().optional(),
});

export type EnderecoBaseInput = z.input<typeof enderecoBaseSchema>;
export type EnderecoInput = z.input<typeof enderecoSchema>;
export type Endereco = z.output<typeof enderecoSchema>;