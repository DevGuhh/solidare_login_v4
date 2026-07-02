/*
  Warnings:

  - The values [OPERADOR] on the enum `RoleUsuario` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleUsuario_new" AS ENUM ('ADMIN', 'USUARIO');
ALTER TABLE "public"."usuarios" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "role" TYPE "RoleUsuario_new" USING ("role"::text::"RoleUsuario_new");
ALTER TYPE "RoleUsuario" RENAME TO "RoleUsuario_old";
ALTER TYPE "RoleUsuario_new" RENAME TO "RoleUsuario";
DROP TYPE "public"."RoleUsuario_old";
ALTER TABLE "usuarios" ALTER COLUMN "role" SET DEFAULT 'USUARIO';
COMMIT;

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "role" SET DEFAULT 'USUARIO';
