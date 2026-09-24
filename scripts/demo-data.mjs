import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const mode = process.argv[2];

function rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rand = rng(20260923);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const daysAgo = (d, h = 10) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, Math.floor(rand() * 60), 0, 0); return x; };

async function seed() {
  const existing = await prisma.user.count({ where: { email: { endsWith: '@demo.local' } } });
  if (existing > 0) { console.log('Ya hay datos DEMO. Ejecuta primero: clean'); return; }

  let store = await prisma.store.findFirst({ where: { active: true }, orderBy: { createdAt: 'asc' } });
  if (!store) store = await prisma.store.create({ data: { name: 'DEMO-Sede Centro', address: 'Calle 1 # 2-3', city: 'Medellin', phone: '3000000000' } });
  console.log('Sede usada:', store.name);

  const clients = [];
  for (const n of ['Carlos', 'Laura', 'Andres', 'Marcela']) {
    clients.push(await prisma.user.create({ data: { email: `demo-${n.toLowerCase()}@demo.local`, password: 'DEMO-SIN-ACCESO', name: `DEMO ${n}`, role: 'CLIENT' } }));
  }

  const catalog = [['DEMO-Air Runner', 289900], ['DEMO-Street Classic', 219900], ['DEMO-Skate Pro', 249900], ['DEMO-Urban High', 329900], ['DEMO-Trail Origen', 359900]];
  const variants = [];
  for (const [i, [name, price]] of catalog.entries()) {
    const product = await prisma.product.create({ data: { name, slug: `demo-${i + 1}`, description: 'Producto de muestra para pruebas', price, basePrice: Math.round(price * 0.6), isSpecial: i === 0, stock: 100, active: true } });
    for (const size of ['38', '40', '42', '44']) {
      const v = await prisma.variant.create({ data: { productId: product.id, storeId: store.id, size, sku: `DEMO-${i + 1}-${size}`, color: 'Negro', price, stock: 25, active: true } });
      variants.push({ id: v.id, productId: product.id, name, size, price });
    }
  }

  const statuses = ['ENTREGADO', 'ENTREGADO', 'ENTREGADO', 'ENTREGADO', 'DESPACHADO', 'PROCESANDO', 'CONFIRMADO', 'RECIBIDO', 'CANCELADO', 'RECHAZADO'];
  const methods = ['EFECTIVO', 'TRANSFERENCIA'];
  const sold = new Map();
  const logs = variants.map((v) => ({ variantId: v.id, storeId: store.id, quantity: 25, changeType: 'ENTRY', reason: 'DEMO-Ingreso inicial', createdAt: daysAgo(95) }));
  const records = [];
  let invoiceNo = 0;

  for (let n = 0; n < 40; n++) {
    const age = Math.floor(Math.pow(rand(), 1.6) * 90);
    const createdAt = daysAgo(age, 9 + Math.floor(rand() * 10));
    let status = pick(statuses);
    if (age > 20 && ['RECIBIDO', 'PROCESANDO', 'CONFIRMADO'].includes(status)) status = 'ENTREGADO';
    const client = pick(clients);
    const method = pick(methods);
    const lines = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => ({ v: pick(variants), q: 1 + Math.floor(rand() * 2) }));
    const totalAmount = lines.reduce((s, l) => s + l.q * l.v.price, 0);
    const sells = !['CANCELADO', 'RECHAZADO'].includes(status);
    const hasEnvio = ['DESPACHADO', 'ENTREGADO'].includes(status);

    const pedido = await prisma.pedido.create({
      data: {
        clientId: client.id, storeId: store.id, status, totalAmount, paymentMethod: method, notes: 'DEMO', createdAt,
        items: { create: lines.map((l) => ({ variantId: l.v.id, quantity: l.q, unitPrice: l.v.price })) },
        ...(hasEnvio ? { envio: { create: { address: 'Calle 10 # 20-30', city: 'Medellin', phone: '3001112233', status: status === 'ENTREGADO' ? 'delivered' : 'shipped', createdAt } } } : {}),
      },
    });

    if (sells) {
      for (const l of lines) {
        sold.set(l.v.id, (sold.get(l.v.id) || 0) + l.q);
        logs.push({ variantId: l.v.id, storeId: store.id, quantity: -l.q, changeType: 'SALE', reason: 'DEMO-Venta', createdAt });
      }
    }
    records.push({ day: createdAt.toDateString(), total: totalAmount, method, sells });

    if (status === 'ENTREGADO') {
      invoiceNo++;
      const subtotal = Math.round(totalAmount / 1.19);
      await prisma.factura.create({
        data: {
          pedidoId: pedido.id, prefix: 'DEMO', invoiceNumber: invoiceNo, fullNumber: `DEMO-${String(invoiceNo).padStart(4, '0')}`,
          customerName: client.name, customerEmail: client.email, customerId: '000000000', paymentMethod: method,
          subtotal, taxAmount: totalAmount - subtotal, totalAmount, issueDate: createdAt, createdAt,
          items: { create: lines.map((l) => { const lt = l.q * l.v.price; return { productName: l.v.name, size: l.v.size, quantity: l.q, unitPrice: l.v.price, taxAmount: lt - Math.round(lt / 1.19), lineTotal: lt }; }) },
        },
      });
    }
  }

  await prisma.inventoryLog.createMany({ data: logs });

  const perProduct = new Map();
  for (const v of variants) {
    const s = sold.get(v.id) || 0;
    const stock = Math.max(0, 25 - s);
    await prisma.variant.update({ where: { id: v.id }, data: { stock } });
    const p = perProduct.get(v.productId) || { stock: 0, sales: 0 };
    p.stock += stock; p.sales += s; perProduct.set(v.productId, p);
  }
  for (const [id, p] of perProduct) await prisma.product.update({ where: { id }, data: { stock: p.stock, salesCount: p.sales } });

  for (let d = 1; d <= 7; d++) {
    const date = daysAgo(d, 20);
    const rows = records.filter((r) => r.day === date.toDateString() && r.sells);
    if (!rows.length) continue;
    const sum = (arr) => arr.reduce((s, r) => s + r.total, 0);
    await prisma.dailyClosing.create({
      data: {
        storeId: store.id, date, totalSales: sum(rows), cashAmount: sum(rows.filter((r) => r.method === 'EFECTIVO')),
        transferAmount: sum(rows.filter((r) => r.method !== 'EFECTIVO')), totalOrders: rows.length, pendingOrders: 0, observations: 'DEMO-Cierre de muestra',
      },
    });
  }

  const types = await prisma.inventoryLog.findMany({ distinct: ['changeType'], select: { changeType: true } });
  console.log('Listo: 4 clientes, 5 productos, 20 variantes, 40 pedidos y', invoiceNo, 'facturas.');
  console.log('changeType presentes en la BD:', types.map((t) => t.changeType).join(', '));
}

async function clean() {
  const uids = (await prisma.user.findMany({ where: { email: { endsWith: '@demo.local' } }, select: { id: true } })).map((u) => u.id);
  const pids = (await prisma.pedido.findMany({ where: { clientId: { in: uids } }, select: { id: true } })).map((p) => p.id);
  const r = {};
  r.cierres = (await prisma.dailyClosing.deleteMany({ where: { observations: { startsWith: 'DEMO' } } })).count;
  r.facturas = (await prisma.factura.deleteMany({ where: { pedidoId: { in: pids } } })).count;
  r.envios = (await prisma.envio.deleteMany({ where: { pedidoId: { in: pids } } })).count;
  r.pedidos = (await prisma.pedido.deleteMany({ where: { id: { in: pids } } })).count;
  const vids = (await prisma.variant.findMany({ where: { sku: { startsWith: 'DEMO-' } }, select: { id: true } })).map((v) => v.id);
  r.logs = (await prisma.inventoryLog.deleteMany({ where: { variantId: { in: vids } } })).count;
  try {
    r.variantes = (await prisma.variant.deleteMany({ where: { id: { in: vids } } })).count;
    r.productos = (await prisma.product.deleteMany({ where: { slug: { startsWith: 'demo-' } } })).count;
  } catch (e) {
    console.log('Hay compras hechas por ti con productos DEMO; los desactivo en vez de borrarlos.');
    await prisma.variant.updateMany({ where: { id: { in: vids } }, data: { active: false } });
    await prisma.product.updateMany({ where: { slug: { startsWith: 'demo-' } }, data: { active: false } });
  }
  try { r.usuarios = (await prisma.user.deleteMany({ where: { id: { in: uids } } })).count; } catch (e) { console.log('No pude borrar algunos usuarios DEMO (tienen pedidos).'); }
  try { r.sedes = (await prisma.store.deleteMany({ where: { name: { startsWith: 'DEMO-' } } })).count; } catch (e) { console.log('No pude borrar la sede DEMO.'); }
  console.log('Borrado:', JSON.stringify(r));
}

if (mode === 'seed') await seed();
else if (mode === 'clean') await clean();
else console.log('Uso: node --env-file=.env scripts/demo-data.mjs seed|clean');
await prisma.$disconnect();