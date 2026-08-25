-- =========================================================
-- Schema completo (revisado)
-- Endereços -> Empresa/Usuário -> Depósito/Veículo -> Entrega/Rota/Parada
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------
-- ENUMs (nomes distintos dos nomes de coluna que os usam,
-- para evitar ambiguidade entre tipo e coluna "status")
-- ---------------------------------------------------------
CREATE TYPE tipo_usr AS ENUM ('OPERADOR','CLIENTE','MOTORISTA');
CREATE TYPE tipo_entrega_status AS ENUM ('PENDENTE','EM_ROTA','ENTREGUE','FALHA');
CREATE TYPE tipo_rota_status AS ENUM ('PLANEJADA','EM_ANDAMENTO','CONCLUIDA');
CREATE TYPE tipo_parada_status AS ENUM ('PENDENTE','CHEGOU','ENTREGUE','FALHA');

-- =========================================================
-- Endereços
-- =========================================================

CREATE TABLE IF NOT EXISTS tb_pais (
    pais_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pais_descricao  VARCHAR(45) NOT NULL,
    pais_sigla      CHAR(2)
);

CREATE TABLE IF NOT EXISTS tb_estado (
    est_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    est_sigla   CHAR(2) NOT NULL,
    est_nome    VARCHAR(45) NOT NULL,
    est_pais_id UUID NOT NULL,
    CONSTRAINT fk_est_pais FOREIGN KEY (est_pais_id) REFERENCES tb_pais(pais_id),
    CONSTRAINT uq_estado_sigla_pais UNIQUE (est_sigla, est_pais_id)
);

CREATE TABLE IF NOT EXISTS tb_cidade (
    cid_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cid_nome    VARCHAR(45) NOT NULL,
    cid_est_id  UUID NOT NULL,
    CONSTRAINT fk_cidade_estado FOREIGN KEY (cid_est_id) REFERENCES tb_estado(est_id)
);

CREATE TABLE IF NOT EXISTS tb_bairro (
    bai_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bai_descricao   VARCHAR(100) NOT NULL,
    bai_cid_id      UUID NOT NULL,
    CONSTRAINT fk_bairro_cidade FOREIGN KEY (bai_cid_id) REFERENCES tb_cidade(cid_id)
);

CREATE TABLE IF NOT EXISTS tb_logradouro (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_descricao   VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tb_endereco_postal (
    endp_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endp_log_id         UUID NOT NULL,
    endp_nome_rua       VARCHAR(255) NOT NULL,
    endp_bairro_id      UUID NOT NULL,
    endp_cidade_id      UUID NOT NULL,
    endp_cep            CHAR(8) NOT NULL,
    dt_criacao          TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_endp_logradouro FOREIGN KEY (endp_log_id) REFERENCES tb_logradouro(log_id),
    CONSTRAINT fk_endp_bairro     FOREIGN KEY (endp_bairro_id) REFERENCES tb_bairro(bai_id),
    CONSTRAINT fk_endp_cidade     FOREIGN KEY (endp_cidade_id) REFERENCES tb_cidade(cid_id)
);

CREATE TABLE IF NOT EXISTS tb_endereco (
    end_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    end_endp_id         UUID NOT NULL,
    endereco_digitado   VARCHAR(250),
    end_numero          VARCHAR(20),
    end_complemento     VARCHAR(255),
    end_latitude        NUMERIC(9,6),
    end_longitude       NUMERIC(9,6),
    dt_criacao          TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_endereco_endp FOREIGN KEY (end_endp_id) REFERENCES tb_endereco_postal(endp_id)
);

-- =========================================================
-- Empresa / Usuário / Telefone
-- =========================================================

CREATE TABLE IF NOT EXISTS tb_telefone (
    tel_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tel_ddd     SMALLINT NOT NULL,
    tel_numero  VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS tb_empresa (
    empresa_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emp_nome        VARCHAR(100) NOT NULL,
    emp_dt_criacao  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tb_usuario (
    usr_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usr_emp_id          UUID NOT NULL,
    usr_nome            VARCHAR(255) NOT NULL,
    usr_email           VARCHAR(255) NOT NULL,
    usr_password_hash   VARCHAR(255) NOT NULL,
    usr_cargo           tipo_usr NOT NULL,
    usr_tel_id          UUID,
    dt_criacao          TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_usr_empresa FOREIGN KEY (usr_emp_id) REFERENCES tb_empresa(empresa_id) ON DELETE CASCADE,
    CONSTRAINT fk_usr_tel     FOREIGN KEY (usr_tel_id) REFERENCES tb_telefone(tel_id) ON DELETE SET NULL,
    CONSTRAINT uq_usr_email   UNIQUE (usr_email)
);

-- =========================================================
-- Depósito / Veículo
-- =========================================================

CREATE TABLE IF NOT EXISTS tb_deposito (
    deposito_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dep_empresa_id  UUID NOT NULL,
    dep_end_id      UUID NOT NULL,
    dep_nome        VARCHAR(45) NOT NULL,
    dt_criacao      TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_dep_empresa FOREIGN KEY (dep_empresa_id) REFERENCES tb_empresa(empresa_id) ON DELETE CASCADE,
    CONSTRAINT fk_dep_end     FOREIGN KEY (dep_end_id) REFERENCES tb_endereco(end_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tb_veiculo (
    vei_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vei_empresa_id      UUID NOT NULL,
    vei_dep_id          UUID NOT NULL,
    vei_motorista_id    UUID,
    vei_nome            VARCHAR(255) NOT NULL,
    vei_capacidade      INT,
    vei_ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    dt_criacao          TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_vei_empresa    FOREIGN KEY (vei_empresa_id) REFERENCES tb_empresa(empresa_id) ON DELETE CASCADE,
    CONSTRAINT fk_vei_deposito   FOREIGN KEY (vei_dep_id) REFERENCES tb_deposito(deposito_id) ON DELETE CASCADE,
    CONSTRAINT fk_vei_motorista  FOREIGN KEY (vei_motorista_id) REFERENCES tb_usuario(usr_id) ON DELETE SET NULL
);

-- =========================================================
-- Entrega / Rota / Parada
-- =========================================================

CREATE TABLE IF NOT EXISTS tb_entrega (
    entrega_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ent_empresa_id          UUID NOT NULL,
    ent_user_id             UUID,
    ent_criado_por_id       UUID,
    ent_pickup_end_id       UUID NOT NULL,
    ent_end_id              UUID NOT NULL,
    ent_descricao           TEXT,
    ent_peso_total          DECIMAL(10,2),
    ent_status              tipo_entrega_status NOT NULL DEFAULT 'PENDENTE',
    dt_criacao              TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_ent_empresa    FOREIGN KEY (ent_empresa_id) REFERENCES tb_empresa(empresa_id) ON DELETE CASCADE,
    CONSTRAINT fk_ent_user       FOREIGN KEY (ent_user_id) REFERENCES tb_usuario(usr_id) ON DELETE SET NULL,
    CONSTRAINT fk_ent_criado_por FOREIGN KEY (ent_criado_por_id) REFERENCES tb_usuario(usr_id) ON DELETE SET NULL,
    CONSTRAINT fk_ent_pickup_end FOREIGN KEY (ent_pickup_end_id) REFERENCES tb_endereco(end_id) ON DELETE CASCADE,
    CONSTRAINT fk_ent_end        FOREIGN KEY (ent_end_id) REFERENCES tb_endereco(end_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tb_entrega_item (
    item_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_entrega_id      UUID NOT NULL,
    item_quantidade      INT NOT NULL,
    item_peso_unitario   DECIMAL(10,2) NOT NULL,
    item_descricao       VARCHAR(255),
    CONSTRAINT fk_item_entrega FOREIGN KEY (item_entrega_id) REFERENCES tb_entrega(entrega_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tb_rota (
    rota_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rota_empresa_id      UUID NOT NULL,
    rota_criado_por_id   UUID,
    rota_status          tipo_rota_status NOT NULL DEFAULT 'PLANEJADA',
    rota_distancia_total NUMERIC(10,2),
    rota_duracao_total   INTEGER,
    dt_criacao           TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_rota_empresa    FOREIGN KEY (rota_empresa_id) REFERENCES tb_empresa(empresa_id) ON DELETE CASCADE,
    CONSTRAINT fk_rota_criado_por FOREIGN KEY (rota_criado_por_id) REFERENCES tb_usuario(usr_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tb_parada (
    parada_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parada_rota_id      UUID NOT NULL,
    parada_vei_id       UUID NOT NULL,
    parada_entrega_id   UUID NOT NULL,
    parada_sequencia    INTEGER NOT NULL,
    parada_status       tipo_parada_status NOT NULL DEFAULT 'PENDENTE',
    dt_criacao          TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_parada_rota    FOREIGN KEY (parada_rota_id) REFERENCES tb_rota(rota_id) ON DELETE CASCADE,
    CONSTRAINT fk_parada_veiculo FOREIGN KEY (parada_vei_id) REFERENCES tb_veiculo(vei_id) ON DELETE CASCADE,
    CONSTRAINT fk_parada_entrega FOREIGN KEY (parada_entrega_id) REFERENCES tb_entrega(entrega_id) ON DELETE CASCADE
);

-- =========================================================
-- Índices
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_estado_pais        ON tb_estado(est_pais_id);
CREATE INDEX IF NOT EXISTS idx_cidade_estado       ON tb_cidade(cid_est_id);
CREATE INDEX IF NOT EXISTS idx_bairro_cidade       ON tb_bairro(bai_cid_id);
CREATE INDEX IF NOT EXISTS idx_endp_logradouro     ON tb_endereco_postal(endp_log_id);
CREATE INDEX IF NOT EXISTS idx_endp_bairro         ON tb_endereco_postal(endp_bairro_id);
CREATE INDEX IF NOT EXISTS idx_endp_cidade         ON tb_endereco_postal(endp_cidade_id);
CREATE INDEX IF NOT EXISTS idx_endp_cep            ON tb_endereco_postal(endp_cep);
CREATE INDEX IF NOT EXISTS idx_endereco_endp       ON tb_endereco(end_endp_id);

CREATE INDEX IF NOT EXISTS idx_usuario_empresa     ON tb_usuario(usr_emp_id);
CREATE INDEX IF NOT EXISTS idx_usuario_tel         ON tb_usuario(usr_tel_id);

CREATE INDEX IF NOT EXISTS idx_deposito_empresa    ON tb_deposito(dep_empresa_id);
CREATE INDEX IF NOT EXISTS idx_deposito_end        ON tb_deposito(dep_end_id);

CREATE INDEX IF NOT EXISTS idx_veiculo_empresa     ON tb_veiculo(vei_empresa_id);
CREATE INDEX IF NOT EXISTS idx_veiculo_deposito    ON tb_veiculo(vei_dep_id);
CREATE INDEX IF NOT EXISTS idx_veiculo_motorista   ON tb_veiculo(vei_motorista_id);

CREATE INDEX IF NOT EXISTS idx_entrega_empresa     ON tb_entrega(ent_empresa_id);
CREATE INDEX IF NOT EXISTS idx_entrega_user        ON tb_entrega(ent_user_id);
CREATE INDEX IF NOT EXISTS idx_entrega_criado_por  ON tb_entrega(ent_criado_por_id);
CREATE INDEX IF NOT EXISTS idx_entrega_pickup_end  ON tb_entrega(ent_pickup_end_id);
CREATE INDEX IF NOT EXISTS idx_entrega_end         ON tb_entrega(ent_end_id);

CREATE INDEX IF NOT EXISTS idx_entrega_item_entrega ON tb_entrega_item(item_entrega_id);

CREATE INDEX IF NOT EXISTS idx_rota_empresa        ON tb_rota(rota_empresa_id);
CREATE INDEX IF NOT EXISTS idx_rota_criado_por     ON tb_rota(rota_criado_por_id);

CREATE INDEX IF NOT EXISTS idx_parada_rota         ON tb_parada(parada_rota_id);
CREATE INDEX IF NOT EXISTS idx_parada_veiculo      ON tb_parada(parada_vei_id);
CREATE INDEX IF NOT EXISTS idx_parada_entrega      ON tb_parada(parada_entrega_id);