import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { createAdminClient } from "@/lib/supabase-admin";

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto").max(100),
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Datos inválidos" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 409 });
  }

  const supabase = createAdminClient();

  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !created?.user) {
    console.error("Error de Supabase al registrar usuario:", authError);
    return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 400 });
  }

  try {
    await prisma.user.create({
      data: {
        id: created.user.id,
        email,
        name,
        password: "",
        role: "CLIENT",
      },
    });
  } catch (dbError: unknown) {
    console.error("Error de Prisma al registrar usuario:", dbError);
    await supabase.auth.admin.deleteUser(created.user.id).catch((rollbackError) => {
      console.error("No se pudo revertir el usuario de Supabase:", rollbackError);
    });
    return NextResponse.json({ error: "No se pudo completar el registro" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
