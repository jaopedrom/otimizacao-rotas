-- CreateEnum
CREATE TYPE "tipo_entrega_status" AS ENUM ('PENDENTE', 'EM_ROTA', 'ENTREGUE', 'FALHA');

-- CreateEnum
CREATE TYPE "tipo_parada_status" AS ENUM ('PENDENTE', 'CHEGOU', 'ENTREGUE', 'FALHA');

-- CreateEnum
CREATE TYPE "tipo_rota_status" AS ENUM ('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "tipo_usr" AS ENUM ('OPERADOR', 'CLIENTE', 'MOTORISTA');

-- CreateTable
CREATE TABLE "tb_bairro" (
    "bai_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bai_descricao" VARCHAR(100) NOT NULL,
    "bai_cid_id" UUID NOT NULL,

    CONSTRAINT "tb_bairro_pkey" PRIMARY KEY ("bai_id")
);

-- CreateTable
CREATE TABLE "tb_cidade" (
    "cid_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cid_nome" VARCHAR(45) NOT NULL,
    "cid_est_id" UUID NOT NULL,

    CONSTRAINT "tb_cidade_pkey" PRIMARY KEY ("cid_id")
);

-- CreateTable
CREATE TABLE "tb_deposito" (
    "deposito_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "dep_empresa_id" UUID NOT NULL,
    "dep_end_id" UUID NOT NULL,
    "dep_nome" VARCHAR(45) NOT NULL,
    "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_deposito_pkey" PRIMARY KEY ("deposito_id")
);

-- CreateTable
CREATE TABLE "tb_empresa" (
    "empresa_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emp_nome" VARCHAR(100) NOT NULL,
    "emp_razao_soc" VARCHAR(100) NOT NULL,
    "emp_cnpj" VARCHAR(14) NOT NULL,
    "emp_email" VARCHAR(100) NOT NULL,
    "emp_telefone" VARCHAR(100) NOT NULL,
    "emp_dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_empresa_pkey" PRIMARY KEY ("empresa_id")
);

-- CreateTable
CREATE TABLE "tb_endereco" (
    "end_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "end_endp_id" UUID NOT NULL,
    "endereco_digitado" VARCHAR(250),
    "end_numero" VARCHAR(20),
    "end_complemento" VARCHAR(255),
    "end_latitude" DECIMAL(9,6),
    "end_longitude" DECIMAL(9,6),
    "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_endereco_pkey" PRIMARY KEY ("end_id")
);

-- CreateTable
CREATE TABLE "tb_endereco_postal" (
    "endp_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "endp_log_id" UUID NOT NULL,
    "endp_nome_rua" VARCHAR(255) NOT NULL,
    "endp_bairro_id" UUID NOT NULL,
    "endp_cidade_id" UUID NOT NULL,
    "endp_cep" CHAR(8) NOT NULL,
    "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_endereco_postal_pkey" PRIMARY KEY ("endp_id")
);

-- CreateTable
CREATE TABLE "tb_entrega" (
    "entrega_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ent_empresa_id" UUID NOT NULL,
    "ent_user_id" UUID,
    "ent_criado_por_id" UUID,
    "ent_pickup_end_id" UUID,
    "ent_end_id" UUID NOT NULL,
    "ent_descricao" TEXT,
    "ent_peso_total" DECIMAL(10,2),
    "ent_status" "tipo_entrega_status" NOT NULL DEFAULT 'PENDENTE',
    "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_entrega_pkey" PRIMARY KEY ("entrega_id")
);

-- CreateTable
CREATE TABLE "tb_entrega_item" (
    "item_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_entrega_id" UUID NOT NULL,
    "item_quantidade" INTEGER NOT NULL,
    "item_peso_unitario" DECIMAL(10,2) NOT NULL,
    "item_descricao" VARCHAR(255),

    CONSTRAINT "tb_entrega_item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "tb_estado" (
    "est_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "est_sigla" CHAR(2) NOT NULL,
    "est_nome" VARCHAR(45) NOT NULL,
    "est_pais_id" UUID NOT NULL,

    CONSTRAINT "tb_estado_pkey" PRIMARY KEY ("est_id")
);

-- CreateTable
CREATE TABLE "tb_logradouro" (
    "log_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "log_descricao" VARCHAR(255) NOT NULL,

    CONSTRAINT "tb_logradouro_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "tb_pais" (
    "pais_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pais_descricao" VARCHAR(45) NOT NULL,
    "pais_sigla" CHAR(2),

    CONSTRAINT "tb_pais_pkey" PRIMARY KEY ("pais_id")
);

-- CreateTable
CREATE TABLE "tb_parada" (
    "parada_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parada_rota_id" UUID NOT NULL,
    "parada_vei_id" UUID NOT NULL,
    "parada_entrega_id" UUID NOT NULL,
    "parada_sequencia" INTEGER NOT NULL,
    "parada_status" "tipo_parada_status" NOT NULL DEFAULT 'PENDENTE',
    "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_parada_pkey" PRIMARY KEY ("parada_id")
);

-- CreateTable
CREATE TABLE "tb_rota" (
    "rota_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rota_empresa_id" UUID NOT NULL,
    "rota_criado_por_id" UUID,
    "rota_status" "tipo_rota_status" NOT NULL DEFAULT 'PLANEJADA',
    "rota_distancia_total" DECIMAL(10,2),
    "rota_duracao_total" INTEGER,
    "rota_maps_url" TEXT,
    "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_rota_pkey" PRIMARY KEY ("rota_id")
);

-- CreateTable
CREATE TABLE "tb_telefone" (
    "tel_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tel_ddd" SMALLINT NOT NULL,
    "tel_numero" VARCHAR(20) NOT NULL,

    CONSTRAINT "tb_telefone_pkey" PRIMARY KEY ("tel_id")
);

-- CreateTable
CREATE TABLE "tb_usuario" (
    "usr_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usr_emp_id" UUID NOT NULL,
    "usr_nome" VARCHAR(255) NOT NULL,
    "usr_email" VARCHAR(255) NOT NULL,
    "usr_password_hash" VARCHAR(255) NOT NULL,
    "usr_cargo" "tipo_usr" NOT NULL,
    "usr_tel_id" UUID,
    "usr_end_id" UUID,
    "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_usuario_pkey" PRIMARY KEY ("usr_id")
);

-- CreateTable
CREATE TABLE "tb_veiculo" (
    "vei_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "vei_empresa_id" UUID NOT NULL,
    "vei_dep_id" UUID NOT NULL,
    "vei_motorista_id" UUID,
    "vei_nome" VARCHAR(255) NOT NULL,
    "vei_placa" VARCHAR(10),
    "vei_capacidade" DECIMAL(10,2),
    "vei_ativo" BOOLEAN NOT NULL DEFAULT true,
    "dt_criacao" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_veiculo_pkey" PRIMARY KEY ("vei_id")
);

-- CreateIndex
CREATE INDEX "idx_bairro_cidade" ON "tb_bairro"("bai_cid_id");

-- CreateIndex
CREATE INDEX "idx_cidade_estado" ON "tb_cidade"("cid_est_id");

-- CreateIndex
CREATE INDEX "idx_deposito_empresa" ON "tb_deposito"("dep_empresa_id");

-- CreateIndex
CREATE INDEX "idx_deposito_end" ON "tb_deposito"("dep_end_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_empresa_emp_cnpj_emp_email_emp_telefone_key" ON "tb_empresa"("emp_cnpj", "emp_email", "emp_telefone");

-- CreateIndex
CREATE INDEX "idx_endereco_endp" ON "tb_endereco"("end_endp_id");

-- CreateIndex
CREATE INDEX "idx_endp_bairro" ON "tb_endereco_postal"("endp_bairro_id");

-- CreateIndex
CREATE INDEX "idx_endp_cep" ON "tb_endereco_postal"("endp_cep");

-- CreateIndex
CREATE INDEX "idx_endp_cidade" ON "tb_endereco_postal"("endp_cidade_id");

-- CreateIndex
CREATE INDEX "idx_endp_logradouro" ON "tb_endereco_postal"("endp_log_id");

-- CreateIndex
CREATE INDEX "idx_entrega_criado_por" ON "tb_entrega"("ent_criado_por_id");

-- CreateIndex
CREATE INDEX "idx_entrega_empresa" ON "tb_entrega"("ent_empresa_id");

-- CreateIndex
CREATE INDEX "idx_entrega_end" ON "tb_entrega"("ent_end_id");

-- CreateIndex
CREATE INDEX "idx_entrega_pickup_end" ON "tb_entrega"("ent_pickup_end_id");

-- CreateIndex
CREATE INDEX "idx_entrega_user" ON "tb_entrega"("ent_user_id");

-- CreateIndex
CREATE INDEX "idx_entrega_item_entrega" ON "tb_entrega_item"("item_entrega_id");

-- CreateIndex
CREATE INDEX "idx_estado_pais" ON "tb_estado"("est_pais_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_estado_sigla_pais" ON "tb_estado"("est_sigla", "est_pais_id");

-- CreateIndex
CREATE INDEX "idx_parada_entrega" ON "tb_parada"("parada_entrega_id");

-- CreateIndex
CREATE INDEX "idx_parada_rota" ON "tb_parada"("parada_rota_id");

-- CreateIndex
CREATE INDEX "idx_parada_veiculo" ON "tb_parada"("parada_vei_id");

-- CreateIndex
CREATE INDEX "idx_rota_criado_por" ON "tb_rota"("rota_criado_por_id");

-- CreateIndex
CREATE INDEX "idx_rota_empresa" ON "tb_rota"("rota_empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_usr_email" ON "tb_usuario"("usr_email");

-- CreateIndex
CREATE INDEX "idx_usuario_empresa" ON "tb_usuario"("usr_emp_id");

-- CreateIndex
CREATE INDEX "idx_usuario_tel" ON "tb_usuario"("usr_tel_id");

-- CreateIndex
CREATE INDEX "idx_usuario_end" ON "tb_usuario"("usr_end_id");

-- CreateIndex
CREATE INDEX "idx_veiculo_deposito" ON "tb_veiculo"("vei_dep_id");

-- CreateIndex
CREATE INDEX "idx_veiculo_empresa" ON "tb_veiculo"("vei_empresa_id");

-- CreateIndex
CREATE INDEX "idx_veiculo_motorista" ON "tb_veiculo"("vei_motorista_id");

-- AddForeignKey
ALTER TABLE "tb_bairro" ADD CONSTRAINT "fk_bairro_cidade" FOREIGN KEY ("bai_cid_id") REFERENCES "tb_cidade"("cid_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_cidade" ADD CONSTRAINT "fk_cidade_estado" FOREIGN KEY ("cid_est_id") REFERENCES "tb_estado"("est_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_deposito" ADD CONSTRAINT "fk_dep_empresa" FOREIGN KEY ("dep_empresa_id") REFERENCES "tb_empresa"("empresa_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_deposito" ADD CONSTRAINT "fk_dep_end" FOREIGN KEY ("dep_end_id") REFERENCES "tb_endereco"("end_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_endereco" ADD CONSTRAINT "fk_endereco_endp" FOREIGN KEY ("end_endp_id") REFERENCES "tb_endereco_postal"("endp_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_endereco_postal" ADD CONSTRAINT "fk_endp_bairro" FOREIGN KEY ("endp_bairro_id") REFERENCES "tb_bairro"("bai_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_endereco_postal" ADD CONSTRAINT "fk_endp_cidade" FOREIGN KEY ("endp_cidade_id") REFERENCES "tb_cidade"("cid_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_endereco_postal" ADD CONSTRAINT "fk_endp_logradouro" FOREIGN KEY ("endp_log_id") REFERENCES "tb_logradouro"("log_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_entrega" ADD CONSTRAINT "fk_ent_criado_por" FOREIGN KEY ("ent_criado_por_id") REFERENCES "tb_usuario"("usr_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_entrega" ADD CONSTRAINT "fk_ent_empresa" FOREIGN KEY ("ent_empresa_id") REFERENCES "tb_empresa"("empresa_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_entrega" ADD CONSTRAINT "fk_ent_end" FOREIGN KEY ("ent_end_id") REFERENCES "tb_endereco"("end_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_entrega" ADD CONSTRAINT "fk_ent_pickup_end" FOREIGN KEY ("ent_pickup_end_id") REFERENCES "tb_endereco"("end_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_entrega" ADD CONSTRAINT "fk_ent_user" FOREIGN KEY ("ent_user_id") REFERENCES "tb_usuario"("usr_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_entrega_item" ADD CONSTRAINT "fk_item_entrega" FOREIGN KEY ("item_entrega_id") REFERENCES "tb_entrega"("entrega_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_estado" ADD CONSTRAINT "fk_est_pais" FOREIGN KEY ("est_pais_id") REFERENCES "tb_pais"("pais_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_parada" ADD CONSTRAINT "fk_parada_entrega" FOREIGN KEY ("parada_entrega_id") REFERENCES "tb_entrega"("entrega_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_parada" ADD CONSTRAINT "fk_parada_rota" FOREIGN KEY ("parada_rota_id") REFERENCES "tb_rota"("rota_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_parada" ADD CONSTRAINT "fk_parada_veiculo" FOREIGN KEY ("parada_vei_id") REFERENCES "tb_veiculo"("vei_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_rota" ADD CONSTRAINT "fk_rota_criado_por" FOREIGN KEY ("rota_criado_por_id") REFERENCES "tb_usuario"("usr_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_rota" ADD CONSTRAINT "fk_rota_empresa" FOREIGN KEY ("rota_empresa_id") REFERENCES "tb_empresa"("empresa_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_usuario" ADD CONSTRAINT "fk_usr_empresa" FOREIGN KEY ("usr_emp_id") REFERENCES "tb_empresa"("empresa_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_usuario" ADD CONSTRAINT "fk_usr_tel" FOREIGN KEY ("usr_tel_id") REFERENCES "tb_telefone"("tel_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_usuario" ADD CONSTRAINT "fk_usr_end" FOREIGN KEY ("usr_end_id") REFERENCES "tb_endereco"("end_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_veiculo" ADD CONSTRAINT "fk_vei_deposito" FOREIGN KEY ("vei_dep_id") REFERENCES "tb_deposito"("deposito_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_veiculo" ADD CONSTRAINT "fk_vei_empresa" FOREIGN KEY ("vei_empresa_id") REFERENCES "tb_empresa"("empresa_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_veiculo" ADD CONSTRAINT "fk_vei_motorista" FOREIGN KEY ("vei_motorista_id") REFERENCES "tb_usuario"("usr_id") ON DELETE SET NULL ON UPDATE NO ACTION;
