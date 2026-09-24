import "server-only";

import { Prisma } from "@prisma/client";

const DEFAULT_TAX_RATE = 19;
type TransactionClient = Prisma.TransactionClient;

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
    if (order.factura) {
      return {\n        success: true,\n        invoiceId: order.factura.id,\n        fullNumber: order.factura.fullNumber,\n        alreadyConfirmed: true,\n      };
    }
    throw new Error("El pedido ya no está pendiente de confirmación.");
  }

  if (order.paymentMethod === "WOMPI" && order.paymentStatus !== "APPROVED") {
    throw new Error("El pago en línea todavía no está aprobado.");
  }

  const updatedStore = await tx.store.update({
    where: { id: order.store.id },
    data: { lastInvoiceNumber: { increment: 1 } },
    select: { invoicePrefix: true, lastInvoiceNumber: true },
  });

  const invoiceNumber = updatedStore.lastInvoiceNumber;
  const prefix = updatedStore.invoicePrefix;
  const fullNumber = prefix + "-" + invoiceNumber;

  let subtotal = 0;
  let taxAmount = 0;

  const invoiceItems = order.items.map((item) => {
    const gross = Number(item.unitPrice) * item.quantity;
    const net = gross / (1 + DEFAULT_TAX_RATE / 100);
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
      customerName: order.customerName || order.client.name || "Cliente Orígenes Kicks",
      customerEmail: order.customerEmail || order.client.email,
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
        storeId: order.store.id,
        changeType: "SALE",
        quantity: item.quantity,
        reason: "Venta confirmada: Recibo " + factura.fullNumber,
        performedById,
      },
    });
  }

  return {
    success: true,
    invoiceId: factura.id,
    fullNumber: factura.fullNumber,
    alreadyConfirmed: false,
  };
}
