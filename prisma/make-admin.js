import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const email = 'jorgebotero190@gmail.com';
  console.log('Buscando usuario: ' + email + '...');

  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Usuario no encontrado. Creandolo ahora mismo...');
      user = await prisma.user.create({
        data: {
          email: email,
          name: 'Jorge Botero',
          password: 'password123', 
          role: 'ADMIN',
        },
      });
      console.log('Exito: Usuario creado y asignado como Administrador.');
    } else if (user.role === 'ADMIN') {
      console.log('El usuario ya es Administrador.');
    } else {
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      console.log('Exito: Ahora eres Administrador del sistema.');
    }
  } catch (error) {
    console.error('Ocurrio un error: ' + error.message);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
