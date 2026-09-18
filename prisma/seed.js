import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tienda = await prisma.store.upsert({
    where: { id: 'tienda-medellin-001' },
    update: {},
    create: { id: 'tienda-medellin-001', name: 'Origenes Kicks Medellin', address: 'Calle 10 # 43-100, El Poblado', city: 'Medellin', phone: '3001234567', active: true, invoicePrefix: 'OK', lastInvoiceNumber: 0 }
  });

  const productos = [
    { id: 'prod-001', name: 'Nike Air Force 1 Blancas', slug: 'nike-af1-blancas', description: 'El clasico que nunca falla.', basePrice: 280000, category: 'Casuales', active: true, isSpecial: false, salesCount: 45, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', sku: 'NK-AF1-W-001', taxRate: 19, color: 'Blanco' },
    { id: 'prod-002', name: 'Adidas Samba OG Negras', slug: 'adidas-samba-negras', description: 'El zapato de las canchas.', basePrice: 320000, discountPrice: 280000, category: 'Streetwear', active: true, isSpecial: true, salesCount: 38, imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80', sku: 'AD-SMB-B-001', taxRate: 19, color: 'Negro' },
    { id: 'prod-003', name: 'New Balance 574 Gris', slug: 'nb-574-gris', description: 'Comodidad all-day con estilo retro.', basePrice: 350000, category: 'Running', active: true, isSpecial: false, salesCount: 22, imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80', sku: 'NB-574-G-001', taxRate: 19, color: 'Gris' },
    { id: 'prod-004', name: 'Jordan 1 Low Negro/Rojo', slug: 'jordan-1-low', description: 'La leyenda en version baja.', basePrice: 480000, discountPrice: 420000, category: 'Basketball', active: true, isSpecial: true, salesCount: 67, imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961a7bd?w=600&q=80', sku: 'JD-J1L-BR-001', taxRate: 19, color: 'Negro/Rojo' },
    { id: 'prod-005', name: 'Vans Old Skool Blanco/Negro', slug: 'vans-old-skool', description: 'El skate shoe original.', basePrice: 220000, category: 'Skate', active: true, isSpecial: false, salesCount: 31, imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80', sku: 'VN-OS-WB-001', taxRate: 19, color: 'Blanco/Negro' },
    { id: 'prod-006', name: 'Converse Chuck Taylor', slug: 'converse-chuck', description: 'El original que no pasa de moda.', basePrice: 180000, category: 'Casuales', active: true, isSpecial: false, salesCount: 55, imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&q=80', sku: 'CV-CT-W-001', taxRate: 19, color: 'Blanco' },
  ];

  for (const p of productos) {
    const { color, ...data } = p;
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
