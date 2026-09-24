-- Protect internal application tables from direct client access.
-- Server-side Prisma access remains available to the database owner role.
-- No client-facing policies are created here: RLS without policies denies
-- access to non-owner roles while remaining portable to local PostgreSQL CI.

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "providers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pedidos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pedido_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "facturas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "factura_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "envios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_closings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_licenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "administración" ENABLE ROW LEVEL SECURITY;
