import { z } from "zod";

export const produtoItemSchema = z.object({
    quantidade: z.number({ message: "Deve ser numérico" }).int().positive("Maior que zero"),
    peso_unitario: z.number({ message: "Deve ser numérico" }).positive("Maior que zero"),
    descricao: z.string().optional(),
});

export type ProdutoItem = z.infer<typeof produtoItemSchema>;

export const entregaItemSchema = z.object({
    id: z.string(), // id temporário no front
    veiculoId: z.string().optional(),
    veiculoNome: z.string().optional(),
    clienteId: z.string(),
    clienteNome: z.string(),
    enderecoDigitado: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    produtos: z.array(produtoItemSchema),
});

export type EntregaItem = z.infer<typeof entregaItemSchema>;

export const novaEntregaFormSchema = z.object({
    tipo_entrega: z.enum(["multi-entrega", "unica-entrega"]),
    veiculoId: z.string().optional(),
    clienteId: z.string().min(1, "Selecione um cliente"),
    enderecoDigitado: z.string().min(5, "Busque e selecione um endereço válido"),
    lat: z.number().optional(),
    lng: z.number().optional(),
    produtos: z.array(produtoItemSchema).min(1, "Adicione pelo menos um produto para a entrega"),
});

export type NovaEntregaFormValues = z.infer<typeof novaEntregaFormSchema>;


export const createLoteEntregasSchema = z.object({
    entregas: z.array(
        z.object({
            clienteId: z.string().uuid(),
            produtos: z.array(z.object({
                quantidade: z.number().int().positive(),
                peso_unitario: z.number().positive(),
                descricao: z.string().optional()
            })).min(1, "A entrega deve ter pelo menos um produto"),
            enderecoDigitado: z.string(),
            lat: z.number().optional(),
            lng: z.number().optional(),
        })
    )
});

export const createLoteEntregasResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    count: z.number(),
});
