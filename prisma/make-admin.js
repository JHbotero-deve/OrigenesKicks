import pkg from "@prisma/client";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!email) {
    throw new Error("Define ADMIN_EMAIL con el correo de una cuenta existente en Supabase Auth.");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new Error("El usuario no existe en Prisma. Crea primero la cuenta mediante Supabase Auth.");
  }

  if (user.role === "OWNER") {
    console.log("El usuario ya es OWNER.");
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });
    console.log(`Rol actualizado a ADMIN para ${user.email}.`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
