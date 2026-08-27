import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { CreateUsuarioType } from "@/src/server/schemas/usuario.schema";
import { criarEnderecoService } from "@/src/server/services/endereco.service";
import { criarTelefoneService } from "@/src/server/services/telefone.service";
import { hashPassword } from "@/src/server/services/hash.service";

type CriarUsuarioServiceData = CreateUsuarioType & {
    empresa_id: string;
};

export async function criarUsuario(
    data: CriarUsuarioServiceData, // <-- 2. USAMOS O NOVO TIPO AQUI
    prismaInstance: Prisma.TransactionClient | PrismaClient = prisma
) {
    //checar CPF
    const usuarioExistente = await prismaInstance.tb_usuario.findFirst({
        where: { usr_cpf: data.cpf },
    });

    if (usuarioExistente) {
        throw new Error("Este CPF já está cadastrado no sistema.");
    }

    //2 hash de senha
    const senhaHash = await hashPassword(data.senha);

    const execute = async (trx: Prisma.TransactionClient) => {
        // cria endereco
        const usr_end = await criarEnderecoService(data, trx);

        // cria telefone
        const usr_telefone = await criarTelefoneService(data.telefone, trx);

        // cria usuario
        return await trx.tb_usuario.create({
            data: {
                usr_nome: data.nome,
                usr_cpf: data.cpf,
                usr_email: data.email,

                usr_cargo: data.cargo as any,

                usr_emp_id: data.empresa_id, // <-- Agora o TS reconhece esse campo!
                usr_password_hash: senhaHash, // <-- Usa a variável do hash criada acima

                usr_end_id: usr_end.end_id,

                ...(usr_telefone && {
                    tb_telefone: {
                        connect: { tel_id: usr_telefone.tel_id },
                    }
                }),
            }
        });
    };

    // Executa a transação
    return '$transaction' in prismaInstance
        ? prismaInstance.$transaction(execute)
        : execute(prismaInstance as Prisma.TransactionClient);
}