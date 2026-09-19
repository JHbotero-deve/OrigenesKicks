import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la Service Role Key de Supabase.
 *
 * Este módulo solo puede ejecutarse en el servidor. Nunca debe importarse
 * desde componentes "use client".
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en las variables de entorno.");
  }

  if (!serviceRoleKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
