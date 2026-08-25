import { z } from "zod";

export const veiculoSchema = z.object({
    veiculo_id: z.string().uuid(),
    veiculo_nome: z.string(),
    veiculo_placa: z.string().nullable().optional(),
    veiculo_capacidade: z.number(),
    carga_atual: z.number().default(0),
    disponivel: z.boolean().default(true),
});

export const veiculoResponseSchema = z.array(veiculoSchema);

export type Veiculo = z.infer<typeof veiculoSchema>;
