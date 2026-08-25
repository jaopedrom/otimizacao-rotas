import { z } from "zod";

export const clienteResponseSchema = z.array(
    z.object({
        usr_id: z.string().uuid(),
        usr_nome: z.string(),
        usr_email: z.string().email(),
        endereco_digitado: z.string().nullable().optional(),
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
    })
);

export type Cliente = z.infer<typeof clienteResponseSchema>[number];
