ALTER TABLE "pedidos"
  ADD COLUMN "tracking_code" TEXT,
  ADD COLUMN "customerName" TEXT,
  ADD COLUMN "customerEmail" TEXT;

UPDATE "pedidos"
SET "tracking_code" = 'OK-' || UPPER(SUBSTRING(MD5("id" || RANDOM()::TEXT) FROM 1 FOR 8))
WHERE "tracking_code" IS NULL;

ALTER TABLE "pedidos"
  ALTER COLUMN "tracking_code" SET NOT NULL;

CREATE UNIQUE INDEX "pedidos_tracking_code_key" ON "pedidos"("tracking_code");
