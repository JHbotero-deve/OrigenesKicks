import 'server-only';

import prisma from "./db";
import { createClient } from "./supabase-server";
import type { Role } from "@prisma/client";

/**
 * Obtiene el usuario autenticado (sesión de Supabase) y su registro
 * correspondiente en la base de datos (con su rol real).
 *
 * IMPORTANTE: usa siempre `dbUser.id` (no `authUser.id`) para filtrar
 * datos en Prisma (pedidos, apartados, etc.) — son ids distintos.
 */
export async function getSessionUser() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    return { authUser: null, dbUser: null };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: authUser.email },
  });

  return { authUser, dbUser };
}

/**
 * Verifica que haya sesión y que el rol esté en la lista permitida.
 * Devuelve { ok: true, dbUser } o { ok: false, reason }.
 * No redirige por sí mismo: cada página/acción decide qué hacer
 * (mostrar "Acceso denegado", redirigir a /login, etc.), pero
 * centraliza la regla para que no queden roles desincronizados
 * entre páginas.
 */
export async function requireRole(allowedRoles: Role[]) {
  const { authUser, dbUser } = await getSessionUser();

  if (!authUser) {
    return { ok: false as const, reason: "NOT_LOGGED_IN" as const, dbUser: null };
  }
  if (!dbUser) {
    return { ok: false as const, reason: "NO_DB_USER" as const, dbUser: null };
  }
  if (!allowedRoles.includes(dbUser.role)) {
    return { ok: false as const, reason: "FORBIDDEN" as const, dbUser };
  }
  return { ok: true as const, reason: null, dbUser };
}

// Grupos de roles reutilizados en varias partes de la app.
// Referencia central del esquema de permisos acordado:
//   OWNER  -> ve y hace todo (reportes, auditoría, retiros manuales, usuarios, productos)
//   ADMIN  -> gestiona productos, inventario, usuarios y aprueba pedidos (no ve auditoría/reportes financieros)
//   SELLER -> "trabajador": solo despacha pedidos (actualiza estado de envío)
export const ROLES_STAFF: Role[] = ["OWNER", "ADMIN", "SELLER"];
export const ROLES_MANAGE_CATALOG: Role[] = ["OWNER", "ADMIN"];
export const ROLES_APPROVE_ORDERS: Role[] = ["OWNER", "ADMIN"];
export const ROLES_DISPATCH: Role[] = ["OWNER", "ADMIN", "SELLER", "DELIVERY"];
export const ROLES_OWNER_ONLY: Role[] = ["OWNER"];


export async function requireAuthenticatedUser() {
  const { authUser, dbUser } = await getSessionUser();

  if (!authUser) {
    return { ok: false as const, reason: "NOT_LOGGED_IN" as const, dbUser: null };
  }

  if (!dbUser) {
    return { ok: false as const, reason: "NO_DB_USER" as const, dbUser: null };
  }

  return { ok: true as const, reason: null, dbUser };
}
