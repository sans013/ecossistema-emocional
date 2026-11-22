-- ============================================================================
-- Ecossistema Emocional - Script DDL (PostgreSQL)
-- Execução como processo administrativo isolado (12-Factor #12)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Usuários (Autenticação + Consentimento LGPD)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_exibicao VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    consentimento_lgpd BOOLEAN NOT NULL DEFAULT FALSE,
    consentimento_aceito_em TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_consentimento_data CHECK (
        (consentimento_lgpd = FALSE AND consentimento_aceito_em IS NULL) OR
        (consentimento_lgpd = TRUE AND consentimento_aceito_em IS NOT NULL)
    )
);

-- 2. Tabela de Preferências (1:1 com Usuário - Personalização separada de Acessibilidade)
CREATE TABLE IF NOT EXISTS preferencias_usuario (
    usuario_id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    -- Personalização
    nivel_ecossistema VARCHAR(20) NOT NULL DEFAULT 'suave'
        CHECK (nivel_ecossistema IN ('desativada', 'suave', 'completa')),
    rotulos_humor_custom JSONB NOT NULL DEFAULT '{}'::jsonb,
    lembretes_ativos BOOLEAN NOT NULL DEFAULT FALSE,
    lembretes_turnos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    -- Acessibilidade (independente da personalização)
    tamanho_fonte VARCHAR(20) NOT NULL DEFAULT 'padrao'
        CHECK (tamanho_fonte IN ('padrao', 'grande', 'extra_grande')),
    rotulos_sempre_visiveis BOOLEAN NOT NULL DEFAULT TRUE,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Catálogo de Contextos (3FN - evita duplicação e garante integridade)
CREATE TABLE IF NOT EXISTS contextos (
    id SMALLSERIAL PRIMARY KEY,
    slug VARCHAR(30) NOT NULL UNIQUE,
    nome VARCHAR(50) NOT NULL
);

INSERT INTO contextos (slug, nome) VALUES
    ('sono', 'Sono'),
    ('estudo', 'Estudo'),
    ('trabalho', 'Trabalho'),
    ('descanso', 'Descanso'),
    ('relacoes', 'Relações')
ON CONFLICT (slug) DO NOTHING;

-- 4. Tabela Principal de Domínio: Registros Emocionais (CRUD completo)
CREATE TABLE IF NOT EXISTS registros_emocionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nivel_humor SMALLINT NOT NULL CHECK (nivel_humor BETWEEN 1 AND 5),
    pensamento TEXT,
    registrado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pensamento_tamanho CHECK (
        pensamento IS NULL OR char_length(pensamento) <= 1000
    )
);

ALTER TABLE registros_emocionais
  ADD COLUMN IF NOT EXISTS mensagem_flor TEXT NULL;

-- 5. Relacionamento N:N entre Registros Emocionais e Contextos
CREATE TABLE IF NOT EXISTS registro_contextos (
    registro_id UUID NOT NULL REFERENCES registros_emocionais(id) ON DELETE CASCADE,
    contexto_id SMALLINT NOT NULL REFERENCES contextos(id) ON DELETE RESTRICT,
    PRIMARY KEY (registro_id, contexto_id)
);

-- Índices para performance em consultas por usuário (Diário e Reflexão)
CREATE INDEX IF NOT EXISTS idx_registros_usuario_data
    ON registros_emocionais (usuario_id, registrado_em DESC);

CREATE INDEX IF NOT EXISTS idx_registro_contextos_contexto
    ON registro_contextos (contexto_id);