import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-guard';

/**
 * Devuelve el perfil (incluyendo rol) del usuario ACTUALMENTE autenticado.
 *
 * Antes este endpoint aceptaba ?email=cualquiera y devolvía el perfil
 * de esa persona sin pedir sesión — cualquiera podía consultar el rol
 * de cualquier cuenta. Ahora el email nunca viene del cliente: se toma
 * de la sesión de Supabase en el servidor.
 */
export async function GET() {
  const { authUser, dbUser } = await getSessionUser();

  if (!authUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  if (!dbUser) {
    return NextResponse.json({ error: 'Usuario no encontrado en la base de datos' }, { status: 404 });
  }

  return NextResponse.json({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  });
}
