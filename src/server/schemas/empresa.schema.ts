import { z } from "zod";

export const createEmpresaSchema = z.object({
    nome_fantasia: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    razao_social: z.string().min(2, "Razão social deve ter no mínimo 2 caracteres"),
    cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve conter exatamente 14 números"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    telefone: z.string().optional(),
    cep: z.string().regex(/^\d{8}$/, "CEP deve conter exatamente 8 números"),
    logradouro: z.string().min(2, "Rua é obrigatória"),
    bairro: z.string().min(2, "Bairro é obrigatório"),
    cidade: z.string().min(2, "Cidade é obrigatória"),
    estado: z.string().length(2, "Estado deve ser a UF"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
});
export type CreateEmpresaType = z.infer<typeof createEmpresaSchema>;

export const empresaResponseSchema = z.array(
    z.object({
        empresa_id: z.string().uuid(), // Altere para z.number() se seu ID for numérico
        emp_nome: z.string(),
        emp_razao_soc: z.string(),
        emp_cnpj: z.string(),
        emp_email: z.string().email().nullable().optional(),

        // Se a sua listagem fizer JOIN (include) com o endereço igual o cliente:
        endereco_digitado: z.string().nullable().optional(),
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
    })
);
export type Empresa = z.infer<typeof empresaResponseSchema>[number];

