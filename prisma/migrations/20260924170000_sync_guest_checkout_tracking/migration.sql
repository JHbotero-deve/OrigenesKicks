ALTER TABLE "pedidos"
  ADD COLUMN IF NOT EXISTS "tracking_code" TEXT,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "customerEmail" TEXT;

UPDATE "pedidos"
SET "tracking_code" = 'OK-' || UPPER(SUBSTRING(MD5("id" || RANDOM()::TEXT) FROM 1 FOR 10))
WHERE "tracking_code" IS NULL;

ALTER TABLE "pedidos"
  ALTER COLUMN "tracking_code" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "pedidos_tracking_code_key"
  ON "pedidos"("tracking_code");
