-- Protect internal application tables from direct client access.
-- Application reads/writes use Prisma on the server; the public client only
-- needs the explicit catalog policies on products, product_variants and stores.

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

CREATE POLICY "Deny direct client access to users" ON "users"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to providers" ON "providers"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to inventory_logs" ON "inventory_logs"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to pedidos" ON "pedidos"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to pedido_items" ON "pedido_items"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to facturas" ON "facturas"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to factura_items" ON "factura_items"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to envios" ON "envios"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to daily_closings" ON "daily_closings"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to app_licenses" ON "app_licenses"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Deny direct client access to administración" ON "administración"
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
