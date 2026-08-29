import { prisma } from "@/src/lib/prisma";
import { comparePassword } from "@/src/server/services/hash.service";
import { LoginInput } from "@/src/server/schemas/login.schema";

export class CredenciaisInvalidasError extends Error {
    constructor() {
        super("E-mail ou senha inválidos");
        this.name = "CredenciaisInvalidasError";
    }
}

export async function autenticarUsuario(data: LoginInput) {
    const usuario = await prisma.tb_usuario.findUnique({
        where: { usr_email: data.email },
    });

    if (!usuario) {
        throw new CredenciaisInvalidasError();
    }

    const senhaValida = await comparePassword(data.password, usuario.usr_password_hash);
    if (!senhaValida) {
        throw new CredenciaisInvalidasError();
    }

    const { usr_password_hash, ...usuarioSemSenha } = usuario;

    return {
        usuario: usuarioSemSenha,
        payload: {
            sub: usuario.usr_id,
            usr_emp_id: usuario.usr_emp_id,
            usr_cargo: usuario.usr_cargo,
        },
    };
}