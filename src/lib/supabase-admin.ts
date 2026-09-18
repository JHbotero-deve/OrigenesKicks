import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con la Service Role Key de Supabase — puede crear/borrar
 * usuarios de Auth directamente (auth.admin.*).
 *
 * SOLO se debe importar desde código que corre en el servidor
 * (Route Handlers, Server Actions). Nunca lo importes desde un
 * componente "use client": la Service Role Key se saltaría todas
 * las reglas de seguridad si llegara al navegador.
 *
 * Requiere la variable de entorno SUPABASE_SERVICE_ROLE_KEY
 * (Supabase Dashboard → Project Settings → API → service_role).
 * Esa clave NO lleva el prefijo NEXT_PUBLIC_ a propósito.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno. ' +
      'Sin ella no se pueden crear cuentas de staff ni completar el registro de clientes.'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
