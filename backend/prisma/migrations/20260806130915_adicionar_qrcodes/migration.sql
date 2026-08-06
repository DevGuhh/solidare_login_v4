-- CreateTable
CREATE TABLE "qrcodes" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "beneficiarioId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qrcodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qrcodes_codigo_key" ON "qrcodes"("codigo");

-- CreateIndex
CREATE INDEX "qrcodes_beneficiarioId_idx" ON "qrcodes"("beneficiarioId");

-- CreateIndex
CREATE INDEX "qrcodes_ativo_idx" ON "qrcodes"("ativo");

-- AddForeignKey
ALTER TABLE "qrcodes" ADD CONSTRAINT "qrcodes_beneficiarioId_fkey" FOREIGN KEY ("beneficiarioId") REFERENCES "beneficiarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
