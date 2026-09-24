-- Additive payment tracking for Wompi. Existing orders are preserved.
ALTER TABLE "pedidos"
  ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentReference" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentTransactionId" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';

CREATE UNIQUE INDEX IF NOT EXISTS "pedidos_paymentReference_key"
  ON "pedidos"("paymentReference");
