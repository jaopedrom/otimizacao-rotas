import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Configura o Prisma de forma isolada para o Seed (assim como na aplicação)
let prisma: PrismaClient;
if (process.env.DATABASE_URL) {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL
    });
    prisma = new PrismaClient({ adapter });
} else {
    throw new Error("DATABASE_URL is required to run seed");
}

async function main() {
    console.log("Iniciando o seed...");

    // 1. Criar ou Buscar Dados Básicos
    let pais = await prisma.tb_pais.findFirst({ where: { pais_sigla: "BR" } });
    if (!pais) {
        pais = await prisma.tb_pais.create({ data: { pais_descricao: "Brasil", pais_sigla: "BR" } });
    }

    let estado = await prisma.tb_estado.findFirst({ where: { est_sigla: "SP" } });
    if (!estado) {
        estado = await prisma.tb_estado.create({ data: { est_nome: "São Paulo", est_sigla: "SP", est_pais_id: pais.pais_id } });
    }

    let cidade = await prisma.tb_cidade.findFirst({ where: { cid_nome: "São Paulo" } });
    if (!cidade) {
        cidade = await prisma.tb_cidade.create({ data: { cid_nome: "São Paulo", cid_est_id: estado.est_id } });
    }

    let bairro = await prisma.tb_bairro.findFirst({ where: { bai_descricao: "Centro", bai_cid_id: cidade.cid_id } });
    if (!bairro) {
        bairro = await prisma.tb_bairro.create({ data: { bai_descricao: "Centro", bai_cid_id: cidade.cid_id } });
    }

    let logradouro = await prisma.tb_logradouro.findFirst({ where: { log_descricao: "Rua Direita" } });
    if (!logradouro) {
        logradouro = await prisma.tb_logradouro.create({ data: { log_descricao: "Rua Direita" } });
    }

    let enderecoPostal = await prisma.tb_endereco_postal.findFirst({ where: { endp_cep: "01002001" } });
    if (!enderecoPostal) {
        enderecoPostal = await prisma.tb_endereco_postal.create({
            data: {
                endp_nome_rua: "Rua Direita",
                endp_cep: "01002001",
                endp_bairro_id: bairro.bai_id,
                endp_cidade_id: cidade.cid_id,
                endp_log_id: logradouro.log_id
            }
        });
    }

    // 2. Criar a Empresa
    let empresa = await prisma.tb_empresa.findFirst({ where: { emp_nome: "Logística Express Ltda" } });
    if (!empresa) {
        empresa = await prisma.tb_empresa.create({ data: { emp_nome: "Logística Express Ltda" } });
    }

    // 3. Criar Endereço e Depósito Base
    let endDeposito = await prisma.tb_endereco.findFirst({ where: { endereco_digitado: "Av. do Estado, 1000 - Centro" } });
    if (!endDeposito) {
        endDeposito = await prisma.tb_endereco.create({
            data: {
                end_endp_id: enderecoPostal.endp_id,
                endereco_digitado: "Av. do Estado, 1000 - Centro",
                end_latitude: -23.5412,
                end_longitude: -46.6273,
            }
        });
    }

    let deposito = await prisma.tb_deposito.findFirst({ where: { dep_empresa_id: empresa.empresa_id } });
    if (!deposito) {
        deposito = await prisma.tb_deposito.create({
            data: {
                dep_nome: "CD Central SP",
                dep_empresa_id: empresa.empresa_id,
                dep_end_id: endDeposito.end_id
            }
        });
    }

    // 4. Criar Veículo Base
    let veiculo = await prisma.tb_veiculo.findFirst({ where: { vei_empresa_id: empresa.empresa_id } });
    if (!veiculo) {
        veiculo = await prisma.tb_veiculo.create({
            data: {
                vei_nome: "Van Furgão - Placa ABC1234",
                vei_empresa_id: empresa.empresa_id,
                vei_dep_id: deposito.deposito_id,
                vei_capacidade: 1500, // 1500kg
                vei_ativo: true
            }
        });
    }

    // 5. Criar o Cliente
    // Apenas tenta criar se o e-mail não existir (o e-mail é único)
    let cliente = await prisma.tb_usuario.findUnique({ where: { usr_email: "cliente@exemplo.com" } });
    if (!cliente) {
        cliente = await prisma.tb_usuario.create({
            data: {
                usr_nome: "João Cliente",
                usr_email: "cliente@exemplo.com",
                usr_password_hash: "hash_de_senha_falsa",
                usr_cargo: "CLIENTE",
                usr_emp_id: empresa.empresa_id
            }
        });
    }

    console.log("===================================");
    console.log("✅ Seed finalizado com sucesso!");
    console.log("ID da Empresa:  ", empresa.empresa_id);
    console.log("ID do Depósito: ", deposito.deposito_id);
    console.log("ID do Veículo:  ", veiculo.vei_id);
    console.log("ID do Cliente:  ", cliente.usr_id);
    console.log("===================================");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
