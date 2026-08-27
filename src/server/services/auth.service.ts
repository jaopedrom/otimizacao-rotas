import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";
import { Signup } from "@/src/server/schemas/auth.schema";
import { hashPassword } from "@/src/server/services/hash.service";


export class EmailOuCnpjDuplicadoError extends Error {
    constructor(campo: string) {
        super(`${campo} já cadastrado`);
        this.name = "EmailOuCnpjDuplicadoError";
    }
}

async function signupEmpresaComOperador(data: Signup) {
    const senhaHash = await hashPassword(data.usuario.usr_password);

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            const empresa = await tx.tb_empresa.create({
                data: {
                    emp_nome: data.empresa.emp_nome,
                    emp_razao_soc: data.empresa.emp_razao_soc,
                    emp_cnpj: data.empresa.emp_cnpj,
                    emp_email: data.empresa.emp_email,
                    emp_telefone: data.empresa.emp_telefone,
                },
            });

            const usuario = await tx.tb_usuario.create({
                data: {
                    usr_emp_id: empresa.empresa_id,
                    usr_nome: data.usuario.usr_nome,
                    usr_email: data.usuario.usr_email,
                    usr_password_hash: senhaHash,
                    usr_cargo: "OPERADOR", // fixo aqui, nunca vindo do client
                },
            });

            return { empresa, usuario };
        });

        // nunca devolver o hash da senha pro caller
        const { usr_password_hash, ...usuarioSemSenha } = resultado.usuario;

        return { empresa: resultado.empresa, usuario: usuarioSemSenha };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            // P2002 = violação de constraint unique
            const campo = (error.meta?.target as string[])?.join(", ") ?? "campo";
            throw new EmailOuCnpjDuplicadoError(campo);
        }
        throw error;
    }
}

export default signupEmpresaComOperador