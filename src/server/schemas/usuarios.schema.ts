import { z } from "zod";

export const clienteResponseSchema = z.array(
    z.object({
        usr_id: z.string().uuid(),
        usr_nome: z.string(),
        usr_email: z.string().email(),
    })
);

export type Cliente = z.infer<typeof clienteResponseSchema>[number];
