import "server-only";

import prisma from "@/lib/db";

const DEFAULT_TAX_RATE = 19;

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function confirmOrderAsSale(
  tx: TransactionClient,
  pedidoId: string,
  performedById: string | null,
) {
  const order = await tx.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      store: true,
      client: true,
      factura: true,
    },
  });

  if (!order) throw new Error("Pedido no encontrado.");
  if (!order.store) throw new Error("El pedido no tiene una tienda asociada.");
  if (order.status !== "RECIBIDO") {
    if (order.factura) return { success: true, invoiceId: order.factura.id, alreadyConfirmed: true };
    throw new Error("El pedido no está pendiente de confirmación.");
  }

  if (order.paymentMethod === "WOMPI" && order.paymentStatus !== "APPROVED") {
    throw new Error("El pago en línea todavía no está aprobado.");
  }

  const existingInvoice = order.factura;
  if (existingInvoice) {
    await tx.pedido.update({
      where: { id: order.id },
      data: { status: "CONFIRMADO", expiresAt: null },
    });
    return { success: true, invoiceId: existingInvoice.id, alreadyConfirmed: true };
  }

  const store = order.store;
  const updatedStore = await tx.store.update({
    where: { id: store.id },
    data: { lastInvoiceNumber: { increment: 1 } },
    select: { invoicePrefix: true, lastInvoiceNumber: true },
  });

  const invoiceNumber = updatedStore.lastInvoiceNumber;
  const prefix = updatedStore.invoicePrefix;
  const fullNumber = `${prefix}-${invoiceNumber}`;

  let subtotal = 0;
  let taxAmount = 0;

  const invoiceItems = order.items.map((item) => {
    const gross = Number(item.unitPrice) * item.quantity;
    const rate = DEFAULT_TAX_RATE / 100;
    const net = gross / (1 + rate);
    const tax = gross - net;
    subtotal += net;
    taxAmount += tax;

    return {
      productName: item.variant.product.name,
      size: item.variant.size,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      taxAmount: tax,
      lineTotal: gross,
    };
  });

  const factura = await tx.factura.create({
    data: {
      pedidoId: order.id,
      prefix,
      invoiceNumber,
      fullNumber,
      customerName: order.client.name || "Cliente Orígenes Kicks",
      customerEmail: order.client.email,
      customerId: order.client.id,
      paymentMethod: order.paymentMethod || "PENDIENTE",
      subtotal,
      taxAmount,
      totalAmount: Number(order.totalAmount),
      items: { create: invoiceItems },
    },
    select: { id: true, fullNumber: true },
  });

  await tx.pedido.update({
    where: { id: order.id },
    data: { status: "CONFIRMADO", expiresAt: null },
  });

  for (const item of order.items) {
    await tx.product.update({
      where: { id: item.variant.productId },
      data: { salesCount: { increment: item.quantity } },
    });

    await tx.inventoryLog.create({
      data: {
        variantId: item.variantId,
        storeId: store.id,
        changeType: "SALE",
        quantity: item.quantity,
        reason: `Venta confirmada: Recibo ${factura.fullNumber}`,
        performedById,
      },
    });
  }

  return { success: true, invoiceId: factura.id, fullNumber: factura.fullNumber, alreadyConfirmed: false };
}
