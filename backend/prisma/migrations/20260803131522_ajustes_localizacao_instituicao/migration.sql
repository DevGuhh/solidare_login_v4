/*
  Warnings:

  - You are about to drop the `reset_password_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reset_password_tokens" DROP CONSTRAINT "reset_password_tokens_usuarioId_fkey";

-- DropTable
DROP TABLE "reset_password_tokens";
