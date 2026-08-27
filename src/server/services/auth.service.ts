// src/server/services/auth.service.ts
import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";
import { Signup } from "@/src/server/schemas/auth.schema";
import { criarEnderecoService } from "@/src/server/services/endereco.service";
import { criarTelefoneService } from "@/src/server/services/telefone.service";
import { hashPassword } from "@/src/server/services/hash.service";

export class CadastroDuplicadoError extends Error {
    constructor(campo: string) {
        super(`${campo} já cadastrado`);
        this.name = "CadastroDuplicadoError";
    }
}

async function signupEmpresaComOperador(data: Signup) {
    const { empresa, usuario } = data;

    try {
        return await prisma.$transaction(async (trx) => {
            // empresa + endereço + telefone próprios
            const enderecoEmpresa = await criarEnderecoService(empresa.endereco, trx);
            const telefoneEmpresa = await criarTelefoneService(empresa.emp_telefone, trx);

            const novaEmpresa = await trx.tb_empresa.create({
                data: {
                    emp_cnpj: empresa.emp_cnpj,
                    emp_email: empresa.emp_email || "",
                    emp_nome: empresa.emp_nome,
                    emp_razao_soc: empresa.emp_razao_soc,
                    emp_end_id: enderecoEmpresa.end_id,
                    tb_telefone: { connect: { tel_id: telefoneEmpresa!.tel_id } },
                },
            });

            // usuário + endereço + telefone próprios (não compartilha com a empresa)
            const enderecoUsuario = await criarEnderecoService(usuario.endereco, trx);
            const telefoneUsuario = await criarTelefoneService(usuario.usr_telefone, trx);
            const senhaHash = await hashPassword(usuario.usr_password);

            const novoUsuario = await trx.tb_usuario.create({
                data: {
                    usr_emp_id: novaEmpresa.empresa_id,
                    usr_nome: usuario.usr_nome,
                    usr_cpf: usuario.usr_cpf,
                    usr_email: usuario.usr_email,
                    usr_dt_nascimento: new Date(usuario.usr_dt_nascimento),
                    usr_password_hash: senhaHash,
                    usr_end_id: enderecoUsuario.end_id,
                    usr_cargo: "OPERADOR", // fixo aqui, nunca vindo do client
                    tb_telefone: { connect: { tel_id: telefoneUsuario!.tel_id } },
                },
            });

            const { usr_password_hash, ...usuarioSemSenha } = novoUsuario;
            return { empresa: novaEmpresa, usuario: usuarioSemSenha };
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const target = error.meta?.target;
            const campo = Array.isArray(target)
                ? target.join(", ")
                : typeof target === "string"
                    ? target
                    : "campo desconhecido";
            throw new CadastroDuplicadoError(campo);
        }
        throw error;
    }
}

export default signupEmpresaComOperador;