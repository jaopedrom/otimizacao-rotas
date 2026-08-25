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
    veiculosIds: z.array(z.string()).optional(),
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
    veiculosIds: z.array(z.string()).optional(),
    clienteId: z.string().min(1, "Selecione um cliente"),
    produtos: z.array(produtoItemSchema).min(1, "Adicione pelo menos um produto para a entrega"),
});

export type NovaEntregaFormValues = z.infer<typeof novaEntregaFormSchema>;


export const createLoteEntregasSchema = z.object({
    depositoId: z.string().uuid("Selecione o depósito de origem"),
    veiculosIds: z.array(z.string().uuid()).min(1, "Selecione pelo menos um veiculo para a entrega"),
    entregas: z.array(
        z.object({
            clienteId: z.string().uuid(),
            produtos: z.array(z.object({
                quantidade: z.number().int().positive(),
                peso_unitario: z.number().positive(),
                descricao: z.string().optional()
            })).min(1, "A entrega deve ter pelo menos um produto"),
        })
    )
});

export const createLoteEntregasResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    count: z.number(),
});

export const finalizarRotaParamsSchema = z.object({
    id: z.string().uuid(),
});

export const finalizarRotaResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
});
