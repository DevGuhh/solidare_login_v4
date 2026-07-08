/*
  Warnings:

  - You are about to drop the `doacoes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "doacoes" DROP CONSTRAINT "doacoes_beneficiarioId_fkey";

-- DropForeignKey
ALTER TABLE "doacoes" DROP CONSTRAINT "doacoes_instituicaoId_fkey";

-- AlterTable
ALTER TABLE "instituicoes_parceiras" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "doacoes";
