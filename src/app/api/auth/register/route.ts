import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { createAdminClient } from '@/lib/supabase-admin';

const RegisterSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto').max(100),
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

/**
 * Registro público de CLIENTES.
 *
 * A propósito, este endpoint NUNCA acepta un "role" desde el cliente:
 * cualquier cuenta creada aquí es CLIENT. Las cuentas de trabajador
 * (SELLER) y administrador (ADMIN) solo las puede crear un OWNER/ADMIN
 * ya autenticado, desde /api/staff (ver ese endpoint) — nunca desde un
 * formulario público. Si se permitiera elegir el rol en el registro,
 * cualquier visitante podría auto-asignarse como administrador.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

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
    // Usamos el MISMO id que Supabase Auth generó, para que
    // Pedido.clientId / Apartado.clientId siempre calcen con la sesión.
    await prisma.user.create({
      data: {
        id: created.user.id,
        email,
        name,
        password: '', // la contraseña real vive en Supabase Auth, no aquí
        role: 'CLIENT',
      },
    });
  } catch (dbError: any) {
    // Si falla la creación en Prisma, revertimos el usuario de Auth
    // para no dejar cuentas huérfanas.
    await supabase.auth.admin.deleteUser(created.user.id).catch(() => {});
    return NextResponse.json({ error: 'No se pudo completar el registro' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
