-- Protect internal application tables from direct client access.
-- The application accesses these tables through the server-side Prisma role.
-- No client-facing policies are intentionally created here: enabling RLS
-- without policies denies access to non-owner roles, including Supabase
-- anon/authenticated roles, while remaining portable to local PostgreSQL CI.

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
