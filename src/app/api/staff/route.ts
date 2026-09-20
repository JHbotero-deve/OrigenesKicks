import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireRole } from '@/lib/auth-guard';
import { createAdminClient } from '@/lib/supabase-admin';

const StaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['SELLER', 'DELIVERY', 'ADMIN']),
});

/**
 * Crear una cuenta de trabajador o administrador.
 *
 * Restringido a OWNER y ADMIN. Un ADMIN puede crear SELLER/DELIVERY/ADMIN,
 * pero el rol OWNER nunca se puede asignar por esta vía (solo se crea
 * manualmente en la base de datos por quien administra el proyecto).
 */
export async function POST(request: Request) {
  const { ok, dbUser } = await requireRole(['OWNER', 'ADMIN']);
  if (!ok || !dbUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = StaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;

  if (dbUser.role === 'ADMIN' && role === 'ADMIN') {
    return NextResponse.json({ error: 'Un ADMIN no puede crear otro ADMIN.' }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese correo' }, { status: 409 });
  }

  const supabase = createAdminClient();
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !created?.user) {
    return NextResponse.json({ error: authError?.message || 'No se pudo crear la cuenta' }, { status: 400 });
  }

  try {
    await prisma.user.create({
      data: { id: created.user.id, email, name, password: '', role },
    });
  } catch {
    await supabase.auth.admin.deleteUser(created.user.id).catch(() => {});
    return NextResponse.json({ error: 'No se pudo completar el registro' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * Lista el personal existente (para la pantalla de gestión de usuarios).
 */
export async function GET() {
  const { ok } = await requireRole(['OWNER', 'ADMIN']);
  if (!ok) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: ['SELLER', 'DELIVERY', 'ADMIN', 'OWNER'] } },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(staff);
}
