// src/services/empresa.service.ts
import { prisma } from "@/src/lib/prisma";
import { CreateEmpresaType } from "@/src/server/schemas/empresa.schema";
import { criarEnderecoService } from "./endereco.service";
import { criarTelefoneService } from "./telefone.service";

export async function criarEmpresaService(data: CreateEmpresaType) {
    // checar cnpj
    const empresaExistente = await prisma.tb_empresa.findFirst({
        where: { emp_cnpj: data.cnpj },
    });

    if (empresaExistente) {
        throw new Error("Este CNPJ já está cadastrado no sistema."); // O erro é capturado pelo Controller
    }

    // transacao no banco
    const novaEmpresa = await prisma.$transaction(async (trx) => {
        const endereco = await criarEnderecoService(data, trx);
        const telefone = await criarTelefoneService(data.telefone, trx);

        return await trx.tb_empresa.create({
            data: {
                emp_cnpj: data.cnpj,
                emp_email: data.email || "",
                emp_nome: data.nome_fantasia,
                emp_razao_soc: data.razao_social,

                ...(telefone && {
                    tb_telefone: {
                        connect: { tel_id: telefone.tel_id },
                    }
                }),

                emp_end_id: endereco.end_id
            }
        });
    });

    return novaEmpresa;
}