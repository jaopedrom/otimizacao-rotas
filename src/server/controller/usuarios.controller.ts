import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";
import { criarUsuario } from "@/src/server/services/usuario.service";
import { CreateUsuarioType } from "@/src/server/schemas/usuario.schema";

// listar usuarios
export async function listarClientesController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const clientes = await prisma.tb_usuario.findMany({
            where: { usr_cargo: 'CLIENTE' },
            select: {
                usr_id: true,
                usr_nome: true,
                usr_email: true,
                tb_endereco_tb_usuario_usr_end_idTotb_endereco: {
                    select: {
                        endereco_digitado: true,
                        end_latitude: true,
                        end_longitude: true
                    }
                }
            },
            orderBy: { usr_nome: 'asc' }
        });

        const clientesMapeados = clientes.map(c => ({
            usr_id: c.usr_id,
            usr_nome: c.usr_nome,
            usr_email: c.usr_email,
            endereco_digitado: c.tb_endereco_tb_usuario_usr_end_idTotb_endereco?.endereco_digitado || null,
            lat: c.tb_endereco_tb_usuario_usr_end_idTotb_endereco?.end_latitude ? Number(c.tb_endereco_tb_usuario_usr_end_idTotb_endereco.end_latitude) : null,
            lng: c.tb_endereco_tb_usuario_usr_end_idTotb_endereco?.end_longitude ? Number(c.tb_endereco_tb_usuario_usr_end_idTotb_endereco.end_longitude) : null,
        }));

        return reply.status(200).send(clientesMapeados);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "Erro ao buscar clientes" });
    }
}

// criar cliente
export async function criarClienteController(
    request: FastifyRequest<{ Body: CreateUsuarioType }>,
    reply: FastifyReply
) {
    try {
        const dadosDoFormulario = request.body;

        // pega primeira empresa
        // mudar para buscar a empresa pelo token
        const empresa = await prisma.tb_empresa.findFirst();
        if (!empresa) {
            return reply.status(400).send({ success: false, message: "Nenhuma empresa base encontrada." });
        }

        // dados de email e senha do cliente
        const emailFinal = dadosDoFormulario.email || `cliente-${randomUUID().substring(0, 8)}@rotas.local`;
        const senhaFinal = dadosDoFormulario.senha || "default-hash-cliente";

        // chama service de criar usuario
        // mudar para receber cargo
        const clienteCriado = await criarUsuario({
            ...dadosDoFormulario,
            email: emailFinal,
            senha: senhaFinal,
            cargo: "CLIENTE",
            empresa_id: empresa.empresa_id // empresa encontrada
        });

        return reply.status(201).send({ success: true, data: clienteCriado });

    } catch (error: any) {
        request.log.error(error);
        return reply.status(400).send({
            success: false,
            message: error.message || "Erro ao criar cliente"
        });
    }
}

// cria usuario no sistema
export async function criarUsuarioController(
    request: FastifyRequest<{ Body: CreateUsuarioType }>,
    reply: FastifyReply
) {
    try {
        const dadosDoFormulario = request.body;

        // SIMULAÇÃO DO ID DA EMPRESA PARA TESTE:
        const empresaIdTemporario = "98ec7da0-08ab-43dd-aed4-392b788e26d1";

        const novoUsuario = await criarUsuario({
            ...dadosDoFormulario,
            empresa_id: empresaIdTemporario
        });

        return reply.status(201).send(novoUsuario);

    } catch (error: any) {
        request.log.error(error);
        return reply.status(400).send({
            erro: error.message || "Erro interno ao criar usuário"
        });
    }
}