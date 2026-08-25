import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { createClienteSchema, CreateClienteType } from "../schemas/clientes.schema";
import { randomUUID } from "crypto";

export async function criarClienteController(
    request: FastifyRequest<{ Body: CreateClienteType }>,
    reply: FastifyReply
) {
    try {
        const data = createClienteSchema.parse(request.body);

        // Pega a primeira empresa do sistema (como não temos auth ainda)
        const empresa = await prisma.tb_empresa.findFirst();
        if (!empresa) {
            return reply.status(400).send({ success: false, message: "Nenhuma empresa base encontrada." });
        }

        const clienteCriado = await prisma.$transaction(async (tx) => {
            // 1. País (Brasil padrão)
            let pais = await tx.tb_pais.findFirst({
                where: { pais_sigla: 'BR' }
            });
            if (!pais) {
                pais = await tx.tb_pais.create({
                    data: { pais_descricao: 'Brasil', pais_sigla: 'BR' }
                });
            }

            // 2. Estado
            let estado = await tx.tb_estado.findFirst({
                where: { est_sigla: data.estado, est_pais_id: pais.pais_id }
            });
            if (!estado) {
                estado = await tx.tb_estado.create({
                    data: { est_sigla: data.estado, est_nome: data.estado, est_pais_id: pais.pais_id }
                });
            }

            // 3. Cidade
            let cidade = await tx.tb_cidade.findFirst({
                where: { cid_nome: data.cidade, cid_est_id: estado.est_id }
            });
            if (!cidade) {
                cidade = await tx.tb_cidade.create({
                    data: { cid_nome: data.cidade, cid_est_id: estado.est_id }
                });
            }

            // 4. Bairro
            let bairro = await tx.tb_bairro.findFirst({
                where: { bai_descricao: data.bairro, bai_cid_id: cidade.cid_id }
            });
            if (!bairro) {
                bairro = await tx.tb_bairro.create({
                    data: { bai_descricao: data.bairro, bai_cid_id: cidade.cid_id }
                });
            }

            // 5. Logradouro
            let logradouro = await tx.tb_logradouro.findFirst({
                where: { log_descricao: data.logradouro }
            });
            if (!logradouro) {
                logradouro = await tx.tb_logradouro.create({
                    data: { log_descricao: data.logradouro }
                });
            }

            // 6. Endereço Postal (CEP)
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

            // 7. Endereço Específico (com Lat/Lng e número)
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

            // 8. Telefone
            let telefoneRecord = null;
            if (data.telefone) {
                const telSoNumeros = data.telefone.replace(/\D/g, '');
                if (telSoNumeros.length >= 10) {
                    const ddd = parseInt(telSoNumeros.substring(0, 2));
                    const numero = telSoNumeros.substring(2);
                    telefoneRecord = await tx.tb_telefone.create({
                        data: {
                            tel_ddd: ddd,
                            tel_numero: numero
                        }
                    });
                }
            }

            // 9. Email fictício se não existir
            const emailFinal = data.email || `cliente-${randomUUID().substring(0, 8)}@rotas.local`;

            // 10. Criar Cliente
            const cliente = await tx.tb_usuario.create({
                data: {
                    usr_nome: data.nome,
                    usr_email: emailFinal,
                    usr_password_hash: "default-hash-cliente", // Cliente não faz login por enquanto
                    usr_cargo: 'CLIENTE',
                    usr_emp_id: empresa.empresa_id,
                    usr_end_id: endereco.end_id,
                    usr_tel_id: telefoneRecord ? telefoneRecord.tel_id : null
                },
                include: { tb_endereco_tb_usuario_usr_end_idTotb_endereco: true }
            });

            return cliente;
        });

        return reply.status(201).send({ success: true, data: clienteCriado });

    } catch (error) {
        request.log.error(error);
        if (error instanceof z.ZodError) {
            return reply.status(400).send({ success: false, message: "Dados inválidos", errors: (error as any).errors });
        }
        return reply.status(500).send({ success: false, message: "Erro ao criar cliente" });
    }
}
