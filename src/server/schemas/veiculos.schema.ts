import { z } from "zod";

export const createVeiculoSchema = z.object({
    veiculo_nome: z.string().min(1, "Nome é obrigatório"),
    veiculo_placa: z.string().nullable().optional(),
    veiculo_capacidade: z.coerce.number({ message: "Capacidade deve ser um número" }).positive("Capacidade deve ser maior que zero"),
    veiculo_ativo: z.boolean().default(true),
});

export const veiculoSchema = createVeiculoSchema.extend({
    veiculo_id: z.string().uuid(),
});

export const veiculoResponseSchema = z.array(veiculoSchema);

export type createVeiculoInput = z.input<typeof createVeiculoSchema>;   // antes da coerção (form)
export type createVeiculo = z.output<typeof createVeiculoSchema>;       // depois da coerção (submit/backend)
export type Veiculo = z.infer<typeof veiculoSchema>;