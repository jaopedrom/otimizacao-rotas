import { z } from "zod";

export const optimizeRouteSchema = z.object({
    empresaId: z.string().uuid(),
    depositoId: z.string().uuid(),
    entregaIds: z.array(z.string().uuid()).min(1, "Selecione pelo menos uma entrega para roteirizar"),
    // Se não enviar veiculos, o sistema deve buscar todos os disponíveis
    veiculoIds: z.array(z.string().uuid()).optional()
});

export type OptimizeRouteType = z.infer<typeof optimizeRouteSchema>;
