import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando activación de AnalizisEstudio...');

  // 1. Creamos la licencia maestra para encender la aplicación
  const license = await prisma.appLicense.upsert({
    where: { licenseKey: 'OK-2026-PRO' },
    update: {},
    create: {
      licenseKey: 'OK-2026-PRO',
      ownerEmail: 'admin@origeneskicks.com',
      masterPin: '2026',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Licencia ACTIVADA:', license.licenseKey);

  // 2. Creamos una sucursal inicial
  const store = await prisma.store.upsert({
    where: { id: 'default-store-id' },
    update: {},
    create: {
      id: 'default-store-id',
      name: 'Orígenes Kicks - Sede Principal',
      address: 'Calle del Barrio #123',
      city: 'Medellín',
      phone: '573000000000',
      active: true,
      invoicePrefix: 'OK',
      lastInvoiceNumber: 0
    },
  });

  console.log('📍 Sede Principal CREADA:', store.name);
  console.log('\n✨ Proceso finalizado. Ya puedes entrar a /analizis-control');
}

main()
  .catch((e) => {
    console.error('❌ Error en la activación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
