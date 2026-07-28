ALTER TABLE "usuarios"
ADD COLUMN IF NOT EXISTS "resetTokenHash" TEXT,
ADD COLUMN IF NOT EXISTS "resetTokenExpiresAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "usuarios_resetTokenHash_idx" ON "usuarios"("resetTokenHash");
