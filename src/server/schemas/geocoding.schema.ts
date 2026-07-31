// src/server/schemas/geocoding.schema.ts
import { z } from "zod";

// o que o operador manda (querystring da busca)
export const geocodeQuerySchema = z.object({
    address: z.string().min(5, "Endereço muito curto"),
});

// cada resultado candidato retornado
export const geocodeCandidateSchema = z.object({
    lat: z.number(),
    lng: z.number(),
    displayName: z.string(),
});

// resposta final: lista de candidatos
export const geocodeResponseSchema = z.array(geocodeCandidateSchema);

export type GeocodeQuery = z.infer<typeof geocodeQuerySchema>;
export type GeocodeCandidate = z.infer<typeof geocodeCandidateSchema>;