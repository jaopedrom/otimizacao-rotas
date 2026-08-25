import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { createDepositoSchema, CreateDepositoType } from "../schemas/depositos.schema";

export async function criarDepositoController(
    request: FastifyRequest<{ Body: CreateDepositoType }>,
    reply: FastifyReply
) {
    try {
        const data = createDepositoSchema.parse(request.body);

        const depositoCriado = await prisma.$transaction(async (tx) => {
            // 1. Empresa
            let empresa = await tx.tb_empresa.findFirst({
                where: { emp_nome: data.empresa_nome }
            });
            if (!empresa) {
                empresa = await tx.tb_empresa.create({
                    data: { emp_nome: data.empresa_nome }
                });
            }

            // 2. País (Brasil padrão)
            let pais = await tx.tb_pais.findFirst({
                where: { pais_sigla: 'BR' }
            });
            if (!pais) {
                pais = await tx.tb_pais.create({
                    data: { pais_descricao: 'Brasil', pais_sigla: 'BR' }
                });
            }

            // 3. Estado
            let estado = await tx.tb_estado.findFirst({
                where: { est_sigla: data.estado, est_pais_id: pais.pais_id }
            });
            if (!estado) {
                estado = await tx.tb_estado.create({
                    data: { est_sigla: data.estado, est_nome: data.estado, est_pais_id: pais.pais_id }
                });
            }

            // 4. Cidade
            let cidade = await tx.tb_cidade.findFirst({
                where: { cid_nome: data.cidade, cid_est_id: estado.est_id }
            });
            if (!cidade) {
                cidade = await tx.tb_cidade.create({
                    data: { cid_nome: data.cidade, cid_est_id: estado.est_id }
                });
            }

            // 5. Bairro
            let bairro = await tx.tb_bairro.findFirst({
                where: { bai_descricao: data.bairro, bai_cid_id: cidade.cid_id }
            });
            if (!bairro) {
                bairro = await tx.tb_bairro.create({
                    data: { bai_descricao: data.bairro, bai_cid_id: cidade.cid_id }
                });
            }

            // 6. Logradouro
            let logradouro = await tx.tb_logradouro.findFirst({
                where: { log_descricao: data.logradouro }
            });
            if (!logradouro) {
                logradouro = await tx.tb_logradouro.create({
                    data: { log_descricao: data.logradouro }
                });
            }

            // 7. Endereço Postal (CEP)
            let endPostal = await tx.tb_endereco_postal.findFirst({
                where: { endp_cep: data.cep }
            });
            if (!endPostal) {
                endPostal = await tx.tb_endereco_postal.create({
                    data: {
                        endp_cep: data.cep,
                        endp_log_id: logradouro.log_id,
                        endp_nome_rua: data.logradouro,
                        endp_bairro_id: bairro.bai_id,
                        endp_cidade_id: cidade.cid_id
                    }
                });
            }

            // 8. Endereço Específico (com Lat/Lng e número)
            const endereco = await tx.tb_endereco.create({
                data: {
                    end_endp_id: endPostal.endp_id,
                    endereco_digitado: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.cidade} - ${data.estado}`,
                    end_numero: data.numero,
                    end_complemento: data.complemento || null,
                    end_latitude: data.lat || null,
                    end_longitude: data.lng || null
                }
            });

            // 9. Criar o Depósito
            const deposito = await tx.tb_deposito.create({
                data: {
                    dep_empresa_id: empresa.empresa_id,
                    dep_end_id: endereco.end_id,
                    dep_nome: data.dep_nome
                }
            });

            return deposito;
        });

        return reply.status(201).send({ success: true, data: depositoCriado });

    } catch (error) {
        request.log.error(error);
        if (error instanceof z.ZodError) {
            return reply.status(400).send({ success: false, message: "Dados inválidos", errors: (error as any).errors });
        }
        return reply.status(500).send({ success: false, message: "Erro ao criar depósito" });
    }
}

export async function listarDepositosController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const depositos = await prisma.tb_deposito.findMany({
            include: { tb_empresa: true }
        });
        return reply.status(200).send(depositos);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ success: false, message: "Erro ao buscar depositos" });
    }
}
