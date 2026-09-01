import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Prueba creando o listando registros básicos
    const users = await prisma.user.findMany();
    console.log("Usuarios en la base de datos:", users);
}

main()
    .catch((e) => {
    console.error("Error en la prueba de base de datos:", e);
    process.exit(1);
    })
    async function cleanup() {
    await prisma.$disconnect();
    }
    cleanup();