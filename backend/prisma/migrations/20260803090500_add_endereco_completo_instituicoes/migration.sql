-- Adiciona os campos estruturados de localização às instituições.
-- As colunas são opcionais para preservar os registros antigos.
ALTER TABLE "instituicoes_parceiras"
ADD COLUMN "cep" TEXT,
ADD COLUMN "logradouro" TEXT,
ADD COLUMN "numero" TEXT,
ADD COLUMN "complemento" TEXT,
ADD COLUMN "bairro" TEXT,
ADD COLUMN "uf" TEXT;
