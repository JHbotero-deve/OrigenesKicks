import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando activación de AnalizisEstudio...');

  // 1. Licencia maestra
  await prisma.appLicense.upsert({
    where: { licenseKey: 'OK-2026-PRO' },
    update: {},
    create: {
      licenseKey: 'OK-2026-PRO',
      ownerEmail: 'admin@origeneskicks.com',
      masterPin: '2026',
      status: 'ACTIVE',
    },
  });

  // 2. Sede Principal
  await prisma.store.upsert({
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

  // 3. PRODUCTO DE MUESTRA CON 3D REAL (Para que el dueño vea la magia)
  const product3d = await prisma.product.upsert({
    where: { slug: 'kicks-pro-3d-test' },
    update: {
      model3dUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb'
    },
    create: {
      name: 'Vans Pro - Edición 3D',
      slug: 'kicks-pro-3d-test',
      description: 'Modelo de prueba para que veas cómo tus clientes pueden girar el zapato en 360 grados. Calidad de fábrica nacional.',
      basePrice: 285000,
      category: 'Urbano',
      gender: 'UNISEX',
      usage: 'DIARIO',
      imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      model3dUrl: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      active: true,
      variants: {
        create: [
          { size: '37', color: 'Negro Clásico', stock: 10, sku: 'TEST-3D-37', storeId: 'default-store-id' },
          { size: '38', color: 'Negro Clásico', stock: 5, sku: 'TEST-3D-38', storeId: 'default-store-id' }
        ]
      }
    }
  });

  console.log('✅ Sistema Activado y Producto 3D Creado:', product3d.name);
  console.log('\n✨ Entra a /products y busca el botón "Mover 3D" en el nuevo modelo.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
