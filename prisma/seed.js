import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tienda = await prisma.store.upsert({
    where: { id: 'tienda-medellin-001' },
    update: {},
    create: { id: 'tienda-medellin-001', name: 'Orígenes Kicks Medellín', address: 'Calle 10 # 43-100, El Poblado', city: 'Medellín', phone: '3001234567', active: true, invoicePrefix: 'OK', lastInvoiceNumber: 0 }
  });

  const model3dUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb';
  const productos = [
    { id: 'prod-001', name: 'Nike Air Force 1 Blancas', slug: 'nike-af1-blancas', description: 'El clásico que nunca falla.', price: 280000, basePrice: 280000, category: 'Casuales', active: true, isSpecial: false, salesCount: 45, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', sku: 'NK-AF1-W-001', taxRate: 19, color: 'Blanco', model3dUrl },
    { id: 'prod-002', name: 'Adidas Samba OG Negras', slug: 'adidas-samba-negras', description: 'El zapato de las canchas.', price: 280000, basePrice: 320000, discountPrice: 280000, category: 'Streetwear', active: true, isSpecial: true, salesCount: 38, imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80', sku: 'AD-SMB-B-001', taxRate: 19, color: 'Negro', model3dUrl },
    { id: 'prod-003', name: 'New Balance 574 Gris', slug: 'nb-574-gris', description: 'Comodidad all-day con estilo retro.', price: 350000, basePrice: 350000, category: 'Running', active: true, isSpecial: false, salesCount: 22, imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80', sku: 'NB-574-G-001', taxRate: 19, color: 'Gris', model3dUrl },
    { id: 'prod-004', name: 'Jordan 1 Low Negro/Rojo', slug: 'jordan-1-low', description: 'La leyenda en versión baja.', price: 420000, basePrice: 480000, discountPrice: 420000, category: 'Basketball', active: true, isSpecial: true, salesCount: 67, imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961a7bd?w=600&q=80', sku: 'JD-J1L-BR-001', taxRate: 19, color: 'Negro/Rojo', model3dUrl },
    { id: 'prod-005', name: 'Vans Old Skool Blanco/Negro', slug: 'vans-old-skool', description: 'El skate shoe original.', price: 220000, basePrice: 220000, category: 'Skate', active: true, isSpecial: false, salesCount: 31, imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80', sku: 'VN-OS-WB-001', taxRate: 19, color: 'Blanco/Negro', model3dUrl },
    { id: 'prod-006', name: 'Converse Chuck Taylor', slug: 'converse-chuck', description: 'El original que no pasa de moda.', price: 180000, basePrice: 180000, category: 'Casuales', active: true, isSpecial: false, salesCount: 55, imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&q=80', sku: 'CV-CT-W-001', taxRate: 19, color: 'Blanco', model3dUrl },
    { id: 'prod-007', name: 'Urban Runner Midnight', slug: 'urban-runner-midnight', description: 'Modelo demo 3D para pruebas de catálogo.', price: 249900, basePrice: 249900, category: 'Running', active: true, isSpecial: false, salesCount: 12, imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80', sku: 'OK-UR-M-001', taxRate: 19, color: 'Negro', model3dUrl },
    { id: 'prod-008', name: 'Street Runner Beach', slug: 'street-runner-beach', description: 'Modelo demo 3D para pruebas de catálogo.', price: 269900, basePrice: 269900, category: 'Streetwear', active: true, isSpecial: false, salesCount: 9, imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80', sku: 'OK-SR-B-001', taxRate: 19, color: 'Arena', model3dUrl },
    { id: 'prod-009', name: 'Kicks Classic Street', slug: 'kicks-classic-street', description: 'Modelo demo 3D para pruebas de catálogo.', price: 289900, basePrice: 289900, category: 'Casuales', active: true, isSpecial: false, salesCount: 7, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80', sku: 'OK-KC-S-001', taxRate: 19, color: 'Blanco', model3dUrl },
    { id: 'prod-010', name: 'Premium Court', slug: 'premium-court', description: 'Modelo demo 3D para pruebas de catálogo.', price: 319900, basePrice: 319900, category: 'Basketball', active: true, isSpecial: false, salesCount: 5, imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=80', sku: 'OK-PC-001', taxRate: 19, color: 'Azul', model3dUrl }
  ];
  for (const p of productos) {
    const { color, category, sku, taxRate, ...data } = p;
    await prisma.product.upsert({ where: { id: p.id }, update: data, create: data });
    for (const t of ['37','38','39','40','41','42','43','44']) {
      const sku = `${p.sku}-T${t}`;
      await prisma.variant.upsert({ where: { sku }, update: { stock: 3 }, create: { productId: p.id, storeId: tienda.id, size: t, color, stock: 3, sku } });
    }
    console.log('OK:', p.name);
  }
  console.log('Seed listo!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
