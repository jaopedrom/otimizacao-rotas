// src/services/endereco.service.ts

import { Prisma } from "@prisma/client/extension";

// Interface baseada nos dados que você precisa para o endereço
export interface DadosEndereco {
    estado: string;
    cidade: string;
    bairro: string;
    logradouro: string;
    cep: string;
    numero: string;
    complemento?: string | null;
    lat?: number | null;
    lng?: number | null;
}

export async function criarEnderecoService(data: DadosEndereco, tx: Prisma.TransactionClient) {
    // 1. País (Brasil padrão)
    let pais = await tx.tb_pais.findFirst({ where: { pais_sigla: 'BR' } });
    if (!pais) {
        pais = await tx.tb_pais.create({ data: { pais_descricao: 'Brasil', pais_sigla: 'BR' } });
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

    return endereco; // Retornamos o endereço completo para quem chamou
}