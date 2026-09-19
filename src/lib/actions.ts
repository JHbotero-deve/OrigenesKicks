"use server";

import prisma from "./db";
import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser, requireRole, ROLES_APPROVE_ORDERS, ROLES_DISPATCH } from "./auth-guard";

const DEFAULT_TAX_RATE = 19;

function publicActionError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    console.error(fallback + ":", error);
  } else {
    console.error(fallback + ":", error);
  }
  return fallback;
}

export async function createOrder(data: {
  clientId: string;
  items: { variantId: string; quantity: number; unitPrice: number }[];
  paymentMethod: string;
  totalAmount: number;
  shippingAddress?: { address: string; city: string; phone: string };
}): Promise<{ success: boolean; pedidoId?: string; error?: string }> {
  try {
    const auth = await requireAuthenticatedUser();
    if (!auth.ok) return { success: false, error: "Debes iniciar sesión para realizar un pedido" };
    const dbUser = auth.dbUser;

    if (!Array.isArray(data.items) || data.items.length === 0) {
      return { success: false, error: "El pedido no contiene productos" };
    }
    const allowedPaymentMethods = ["TRANSFERENCIA", "CONTRA_ENTREGA_MEDELLIN", "EFECTIVO"];
    if (!allowedPaymentMethods.includes(data.paymentMethod)) {
      return { success: false, error: "Método de pago no válido" };
    }
    if (data.items.length > 50) {
      return { success: false, error: "El pedido contiene demasiados productos" };
    }
    if (data.items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      return { success: false, error: "Cantidad de producto inválida" };
    }

    const result = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const itemsWithRealPrices: { variantId: string; quantity: number; unitPrice: number }[] = [];
      let assignedStoreId: string | null = null;

      for (const item of data.items) {
        const variant = await tx.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true, store: true },
        });

        if (!variant || !variant.product.active || variant.stock < item.quantity) {
          throw new Error("No hay suficiente stock disponible para uno de los productos.");
        }

        if (!assignedStoreId) assignedStoreId = variant.storeId;
        if (assignedStoreId !== variant.storeId) {
          throw new Error("Todos los productos del pedido deben pertenecer a la misma tienda.");
        }

        const price = Number(variant.product.discountPrice ?? variant.product.basePrice);
        calculatedTotal += price * item.quantity;

        itemsWithRealPrices.push({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: price,
        });
      }

      if (!assignedStoreId) {
        throw new Error("No se pudo determinar la tienda del pedido.");
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const pedido = await tx.pedido.create({
        data: {
          clientId: dbUser.id,
          storeId: assignedStoreId,
          totalAmount: calculatedTotal,
          paymentMethod: data.paymentMethod,
          status: "RECIBIDO",
          expiresAt,
          items: { create: itemsWithRealPrices },
          ...(data.shippingAddress && {
            envio: {
              create: {
                address: data.shippingAddress.address.trim(),
                city: data.shippingAddress.city.trim(),
                phone: data.shippingAddress.phone.trim(),
                status: "PENDIENTE",
              },
            },
          }),
        },
      });

      for (const item of data.items) {
        const stockUpdate = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (stockUpdate.count !== 1) {
          throw new Error("El stock cambió mientras procesábamos el pedido. Actualiza el carrito e inténtalo de nuevo.");
        }

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            storeId: assignedStoreId,
            changeType: "RESERVATION",
            quantity: item.quantity,
            reason: `Reserva de 24h (Pedido #${pedido.id.slice(0, 8)})`,
            performedById: dbUser.id,
          },
        });
      }

      return { success: true, pedidoId: pedido.id };
    });

    revalidatePath("/products");
    revalidatePath("/dashboard/orders");
    return result;
  } catch (error) {
    return { success: false, error: publicActionError(error, "No se pudo crear el pedido") };
  }
}

export async function approveOrder(pedidoId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(ROLES_APPROVE_ORDERS);
  if (!auth.ok) return { success: false, error: "No tienes permiso para aprobar ventas" };
  const dbUser = auth.dbUser;

  try {
    await prisma.$transaction(async (tx) => {
      const p = await tx.pedido.findUnique({
        where: { id: pedidoId },
        include: { items: { include: { variant: { include: { product: true } } } }, store: true, client: true },
      });

      if (!p || p.status !== "RECIBIDO") throw new Error("Pedido no válido para aprobación");
      if (!p.store) throw new Error("El pedido no tiene una tienda asociada");
      if (dbUser.role !== "OWNER" && p.storeId !== dbUser.workStoreId) {
        throw new Error("No tienes acceso a este pedido");
      }

      await tx.pedido.update({
        where: { id: pedidoId },
        data: { status: "CONFIRMADO", expiresAt: null },
      });

      const store = p.store;
      const updatedStore = await tx.store.update({
        where: { id: store.id },
        data: { lastInvoiceNumber: { increment: 1 } },
        select: { id: true, invoicePrefix: true, lastInvoiceNumber: true },
      });

      const nextInvoiceNumber = updatedStore.lastInvoiceNumber;
      const prefix = updatedStore.invoicePrefix;

      const factura = await tx.factura.create({
        data: {
          invoiceNumber: nextInvoiceNumber,
          prefix,
          fullNumber: `${prefix}-${nextInvoiceNumber}`,
          customerName: p.client.name,
          customerIdType: "CC",
          customerId: p.client.id,
          customerEmail: p.client.email,
          totalAmount: p.totalAmount,
          subtotal: p.items.reduce((sum, item) => {
            const rate = Number(item.variant.product.taxRate ?? DEFAULT_TAX_RATE) / 100;
            const gross = Number(item.unitPrice) * item.quantity;
            return sum + (rate > 0 ? gross / (1 + rate) : gross);
          }, 0),
          taxAmount: p.items.reduce((sum, item) => {
            const rate = Number(item.variant.product.taxRate ?? DEFAULT_TAX_RATE) / 100;
            const gross = Number(item.unitPrice) * item.quantity;
            return sum + (rate > 0 ? gross - gross / (1 + rate) : 0);
          }, 0),
          paymentMethod: p.paymentMethod,
          status: "VALIDADA",
          pedidoId: p.id,
          items: {
            create: p.items.map((item) => ({
              productName: item.variant.product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: Number(item.variant.product.taxRate ?? DEFAULT_TAX_RATE),
              taxAmount: (() => {
                const rate = Number(item.variant.product.taxRate ?? DEFAULT_TAX_RATE) / 100;
                const gross = Number(item.unitPrice) * item.quantity;
                return rate > 0 ? gross - gross / (1 + rate) : 0;
              })(),
              lineTotal: Number(item.unitPrice) * item.quantity,
              size: item.variant.size,
            })),
          },
        },
      });

      for (const item of p.items) {
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
            performedById: dbUser.id,
          },
        });
      }
    });

    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: publicActionError(error, "No se pudo aprobar el pedido") };
  }
}

export async function releaseExpiredReservations() {
  const auth = await requireRole(ROLES_APPROVE_ORDERS);
  if (!auth.ok) return { success: false, error: "No autorizado" };

  const now = new Date();
  try {
    return await prisma.$transaction(async (tx) => {
      const expiredOrders = await tx.pedido.findMany({
        where: { status: "RECIBIDO", expiresAt: { lt: now } },
        include: { items: true },
      });

      const systemUser = await tx.user.findFirst({
        where: { role: "OWNER" },
        select: { id: true },
      });
      if (expiredOrders.length && !systemUser) {
        throw new Error("No existe un usuario OWNER para registrar la liberación automática.");
      }

      for (const order of expiredOrders) {
        for (const item of order.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });

          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,
              storeId: order.storeId,
              changeType: "RETURN",
              quantity: item.quantity,
              reason: `Vencieron las 24h del pedido #${order.id.slice(0, 8)}`,
              performedById: systemUser!.id,
            },
          });
        }
        await tx.pedido.update({
          where: { id: order.id },
          data: { status: "CANCELADO", notes: "Cancelado por falta de pago (24h)." },
        });
      }
      return { success: true, released: expiredOrders.length };
    });
  } catch (error) {
    return { success: false, error: publicActionError(error, "No se pudieron liberar las reservas vencidas") };
  }
}

export async function getPublicOrderStatus(orderCode: string) {
  try {
    const normalizedCode = orderCode?.trim();
    if (!normalizedCode || normalizedCode.length < 4 || normalizedCode.length > 80) {
      return { success: false, message: "Código de pedido inválido." };
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedCode);
    if (!isUuid && !/^[A-Za-z0-9-]{3,40}$/.test(normalizedCode)) {
      return { success: false, message: "Código de pedido inválido." };
    }

    const order = await prisma.pedido.findFirst({
      where: isUuid
        ? { id: normalizedCode }
        : { invoice: { fullNumber: normalizedCode.toUpperCase() } },
      include: {
        envio: true,
        store: { select: { phone: true, name: true } },
        items: { include: { variant: { include: { product: true } } } },
      },
    });

    if (!order) return { success: false, message: "No encontramos ningún pedido con ese código." };

    return {
      success: true,
      status: order.status,
      date: order.createdAt,
      city: order.envio?.city || "Medellín",
      storePhone: order.store?.phone || null,
      storeName: order.store?.name || null,
      items: order.items.map((i) => i.variant.product.name),
    };
  } catch (error) {
    console.error("Error al consultar pedido público:", error);
    return { success: false, message: "Error al consultar el sistema." };
  }
}

export async function updateShippingStatus(
  shippingId: string,
  status: "PENDIENTE" | "EN_RUTA" | "ENTREGADO" | "FALLIDO" | "RETORNADO",
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(ROLES_DISPATCH);
  if (!auth.ok) return { success: false, error: "No tienes permisos para actualizar el envío" };
  const dbUser = auth.dbUser;

  try {
    await prisma.$transaction(async (tx) => {
      const envio = await tx.envio.findUnique({
        where: { id: shippingId },
        include: { pedido: true },
      });

      if (!envio) throw new Error("Envío no encontrado");

      if (
        dbUser.role !== "OWNER" &&
        dbUser.role !== "ADMIN" &&
        envio.pedido.storeId !== dbUser.workStoreId
      ) {
        throw new Error("No tienes acceso a este envío");
      }

      if (status === "ENTREGADO" && envio.status !== "EN_RUTA") {
        throw new Error("Un envío solo puede marcarse entregado cuando está en ruta");
      }

      await tx.envio.update({
        where: { id: shippingId },
        data: { status },
      });

      if (status === "ENTREGADO") {
        await tx.pedido.update({
          where: { id: envio.pedidoId },
          data: { status: "ENTREGADO" },
        });
      } else if (status === "FALLIDO" || status === "RETORNADO") {
        await tx.pedido.update({
          where: { id: envio.pedidoId },
          data: { status: "RECHAZADO" },
        });
      }
    });

    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: publicActionError(error, "No se pudo actualizar el envío") };
  }
}
