import "server-only";

import prisma from "@/lib/db";

export async function releaseExpiredReservationsInternal() {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const expiredOrders = await tx.pedido.findMany({
      where: {
        status: "RECIBIDO",
        expiresAt: { lt: now },
        OR: [
          { paymentStatus: null },
          { paymentStatus: { not: "APPROVED" } },
        ],
      },
      include: { items: true },
    });

    let released = 0;

    for (const order of expiredOrders) {
      const claimed = await tx.pedido.updateMany({
        where: {
          id: order.id,
          status: "RECIBIDO",
          expiresAt: { lt: now },
          OR: [
            { paymentStatus: null },
            { paymentStatus: { not: "APPROVED" } },
          ],
        },
        data: {
          status: "CANCELADO",
          notes: "Reserva cancelada por vencimiento de 24 horas.",
        },
      });

      if (claimed.count !== 1) continue;

      for (const item of order.items) {
        const restored = await tx.variant.updateMany({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });

        if (restored.count !== 1) {
          throw new Error(`No se pudo restaurar el stock de la variante ${item.variantId}.`);
        }

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            storeId: order.storeId,
            changeType: "RETURN",
            quantity: item.quantity,
            reason: `Reserva vencida: Pedido #${order.id.slice(0, 8)}`,
            performedById: null,
          },
        });
      }

      released += 1;
    }

    return { success: true, released };
  });
}
