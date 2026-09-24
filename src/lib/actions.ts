"use server";

import prisma from "./db";
import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser, requireRole, ROLES_APPROVE_ORDERS, ROLES_DISPATCH } from "./auth-guard";
import { sendOrderEmail } from "./mail";
import { confirmOrderAsSale } from "./order-confirmation";
import { releaseExpiredReservationsInternal } from "./reservations";
import crypto from "node:crypto";

const MAX_SHIPPING_FIELD_LENGTH = 200;

function publicActionError(error: unknown, fallback: string) {
  console.error(fallback + ":", error);
  return fallback;
}

export async function createOrder(data: {
  clientId?: string;
  customerName: string;
  customerEmail?: string;
  items: { variantId: string; quantity: number; unitPrice: number }[];
  paymentMethod: string;
  totalAmount: number;
  shippingAddress?: { address: string; city: string; phone: string };
  notes?: string;
}): Promise<{ success: boolean; pedidoId?: string; trackingCode?: string; error?: string }> {
  try {
    const auth = await requireAuthenticatedUser();
    const dbUser = auth.ok ? auth.dbUser : null;
    const guestName = data.customerName?.trim() || "";
    const guestEmail = data.customerEmail?.trim().toLowerCase() || "";

    if (!dbUser && guestName.length < 2) {
      return { success: false, error: "Escribe el nombre completo del cliente." };
    }

    if (!dbUser && guestEmail && !/^\S+@\S+\.\S+$/.test(guestEmail)) {
      return { success: false, error: "Ingresa un correo válido." };
    }

    if (guestName.length > 100 || guestEmail.length > 150) {
      return { success: false, error: "Los datos del cliente son demasiado largos." };
    }

    if (!dbUser && data.paymentMethod === "WOMPI" && !guestEmail) {
      return { success: false, error: "Para pagar con Wompi necesitas indicar un correo." };
    }

    await releaseExpiredReservationsInternal();

    if (!Array.isArray(data.items) || data.items.length === 0) {
      return { success: false, error: "El pedido no contiene productos" };
    }

    const allowedPaymentMethods = ["WOMPI", "TRANSFERENCIA", "CONTRA_ENTREGA_MEDELLIN", "EFECTIVO"];
    if (!allowedPaymentMethods.includes(data.paymentMethod)) {
      return { success: false, error: "Método de pago no válido" };
    }

    if (data.items.length > 50) {
      return { success: false, error: "El pedido contiene demasiados productos" };
    }

    if (data.items.some((item) => !item?.variantId || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      return { success: false, error: "Cantidad de producto inválida" };
    }

    if (data.notes && data.notes.trim().length > 500) {
      return { success: false, error: "Las observaciones no pueden superar 500 caracteres" };
    }

    if (data.shippingAddress) {
      const address = data.shippingAddress.address.trim();
      const city = data.shippingAddress.city.trim();
      const phone = data.shippingAddress.phone.trim();

      if (
        !address ||
        address.length > MAX_SHIPPING_FIELD_LENGTH ||
        !city ||
        city.length > MAX_SHIPPING_FIELD_LENGTH ||
        !phone ||
        phone.length > 30
      ) {
        return { success: false, error: "Datos de envío inválidos" };
      }
    }

    const requestedItems = new Map<string, number>();
    for (const item of data.items) {
      requestedItems.set(item.variantId, (requestedItems.get(item.variantId) ?? 0) + item.quantity);
    }

    const paymentReference = data.paymentMethod === "WOMPI" ? `OK-${crypto.randomUUID()}` : null;
    const trackingCode = `OK-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

    const result = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const itemsWithRealPrices: { variantId: string; quantity: number; unitPrice: number }[] = [];
      let assignedStoreId: string | null = null;

      for (const [variantId, quantity] of requestedItems) {
        const variant = await tx.variant.findUnique({
          where: { id: variantId },
          include: { product: true },
        });

        if (!variant || !variant.active || !variant.product.active) {
          throw new Error("Uno de los productos ya no está disponible.");
        }

        if (!assignedStoreId) assignedStoreId = variant.storeId;
        if (assignedStoreId !== variant.storeId) {
          throw new Error("Todos los productos del pedido deben pertenecer a la misma tienda.");
        }

        const stockUpdate = await tx.variant.updateMany({
          where: { id: variant.id, active: true, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });

        if (stockUpdate.count !== 1) {
          throw new Error("El stock cambió mientras procesábamos el pedido. Actualiza el carrito e inténtalo de nuevo.");
        }

        const basePrice = Number(variant.product.basePrice ?? variant.product.price);
        const discountPrice =
          variant.product.discountPrice == null ? null : Number(variant.product.discountPrice);
        const price =
          discountPrice !== null &&
          Number.isFinite(discountPrice) &&
          discountPrice > 0 &&
          discountPrice < basePrice
            ? discountPrice
            : basePrice;

        if (!Number.isFinite(basePrice) || basePrice <= 0 || !Number.isFinite(price) || price <= 0) {
          throw new Error("El precio de uno de los productos no es válido.");
        }

        calculatedTotal += price * quantity;
        itemsWithRealPrices.push({ variantId, quantity, unitPrice: price });
      }

      if (!assignedStoreId) {
        throw new Error("No se pudo determinar la tienda del pedido.");
      }

      const client =
        dbUser ??
        (await tx.user.create({
          data: {
            email: `guest-${crypto.randomUUID()}@origenes.local`,
            password: "",
            name: guestName,
            role: "CLIENT",
          },
          select: { id: true, email: true, name: true },
        }));

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const pedido = await tx.pedido.create({
        data: {
          clientId: client.id,
          trackingCode,
          customerName: dbUser ? dbUser.name : guestName,
          customerEmail: dbUser ? dbUser.email : guestEmail || null,
          storeId: assignedStoreId,
          totalAmount: calculatedTotal,
          paymentMethod: data.paymentMethod,
          paymentProvider: data.paymentMethod === "WOMPI" ? "WOMPI" : null,
          paymentReference,
          paymentStatus: "PENDING",
          status: "RECIBIDO",
          expiresAt,
          notes: data.notes?.trim() || null,
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
        select: { id: true, trackingCode: true },
      });

      for (const item of itemsWithRealPrices) {
        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            storeId: assignedStoreId,
            changeType: "RESERVATION",
            quantity: item.quantity,
            reason: `Reserva de 24h · Pedido #${pedido.trackingCode}`,
            performedById: dbUser?.id ?? null,
          },
        });
      }

      return { success: true, pedidoId: pedido.id, trackingCode: pedido.trackingCode };
    });

    if (result.success && result.pedidoId) {
      const emailItems = await prisma.pedidoItem.findMany({
        where: { pedidoId: result.pedidoId },
        include: { variant: { include: { product: true } } },
      });

      const createdOrder = await prisma.pedido.findUnique({
        where: { id: result.pedidoId },
        select: { totalAmount: true, customerEmail: true },
      });

      const mailTarget = createdOrder?.customerEmail || dbUser?.email;
      if (mailTarget) {
        const mailResult = await sendOrderEmail(
          mailTarget,
          result.pedidoId,
          Number(createdOrder?.totalAmount ?? 0),
          emailItems.map((item) => ({
            name: item.variant.product.name,
            size: item.variant.size ?? "-",
            color: item.variant.color ?? "-",
            quantity: item.quantity,
            price: Number(item.unitPrice),
          })),
        );

        if (!mailResult.success) {
          console.warn("Pedido creado; no se pudo enviar la constancia por correo:", mailResult.error);
        }
      }
    }

    revalidatePath("/products");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/inventory");
    return result;
  } catch (error) {
    return { success: false, error: publicActionError(error, "No se pudo crear el pedido") };
  }
}
export async function approveOrder(pedidoId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(ROLES_APPROVE_ORDERS);
  if (!auth.ok) return { success: false, error: "No tienes permiso para aprobar ventas" };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.pedido.findUnique({
        where: { id: pedidoId },
        select: {
          id: true,
          storeId: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
        },
      });

      if (!order) throw new Error("Pedido no encontrado.");
      if (order.status !== "RECIBIDO") throw new Error("El pedido ya fue procesado.");
      if (!order.storeId) throw new Error("El pedido no tiene una tienda asociada.");

      if (
        auth.dbUser.role !== "OWNER" &&
        order.storeId !== auth.dbUser.workStoreId
      ) {
        throw new Error("No tienes acceso a este pedido.");
      }

      if (order.paymentMethod === "WOMPI" && order.paymentStatus !== "APPROVED") {
        throw new Error("No se puede facturar: el pago Wompi todavía no está aprobado.");
      }

      return confirmOrderAsSale(tx, order.id, auth.dbUser.id);
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/products");
    return { success: true, error: undefined };
  } catch (error) {
    return { success: false, error: publicActionError(error, "No se pudo aprobar el pedido") };
  }
}

export async function releaseExpiredReservations() {
  const auth = await requireRole(ROLES_APPROVE_ORDERS);
  if (!auth.ok) return { success: false, error: "No autorizado" };

  try {
    const result = await releaseExpiredReservationsInternal();
    revalidatePath("/products");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/inventory");
    return result;
  } catch (error) {
    return { success: false, error: publicActionError(error, "No se pudieron liberar las reservas vencidas") };
  }
}

export async function updateShippingStatus(
  shippingId: string,
  status: "PENDIENTE" | "EN_RUTA" | "ENTREGADO" | "FALLIDO" | "RETORNADO",
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(ROLES_DISPATCH);
  if (!auth.ok) return { success: false, error: "No tienes permisos para actualizar el envío" };

  try {
    await prisma.$transaction(async (tx) => {
      const envio = await tx.envio.findUnique({
        where: { id: shippingId },
        include: { pedido: { include: { items: true } } },
      });

      if (!envio) throw new Error("Envío no encontrado");

      if (
        auth.dbUser.role !== "OWNER" &&
        auth.dbUser.role !== "ADMIN" &&
        envio.pedido.storeId !== auth.dbUser.workStoreId
      ) {
        throw new Error("No tienes acceso a este envío");
      }

      if (status === "EN_RUTA" && envio.status !== "PENDIENTE") {
        throw new Error("El envío solo puede pasar a ruta desde estado pendiente.");
      }

      if (status === "ENTREGADO" && envio.status !== "EN_RUTA") {
        throw new Error("Un envío solo puede marcarse entregado cuando está en ruta");
      }

      if (status === "RETORNADO" && envio.status !== "EN_RUTA") {
        throw new Error("Un envío solo puede retornar después de salir a ruta.");
      }

      if (status === envio.status) return;

      await tx.envio.update({
        where: { id: shippingId },
        data: { status },
      });

      if (status === "EN_RUTA") {
        await tx.pedido.update({
          where: { id: envio.pedidoId },
          data: { status: "DESPACHADO" },
        });
      }

      if (status === "ENTREGADO") {
        await tx.pedido.update({
          where: { id: envio.pedidoId },
          data: { status: "ENTREGADO" },
        });
      }

      if (status === "FALLIDO") {
        await tx.pedido.update({
          where: { id: envio.pedidoId },
          data: { status: "RECHAZADO" },
        });
      }

      if (status === "RETORNADO") {
        await tx.pedido.update({
          where: { id: envio.pedidoId },
          data: { status: "RECHAZADO" },
        });

        for (const item of envio.pedido.items) {
          const restored = await tx.variant.updateMany({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });

          if (restored.count !== 1) {
            throw new Error("No se pudo restaurar el inventario del pedido retornado.");
          }

          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,
              storeId: envio.pedido.storeId,
              changeType: "RETURN",
              quantity: item.quantity,
              reason: `Pedido retornado a inventario · #${envio.pedidoId.slice(0, 8)}`,
              performedById: auth.dbUser.id,
            },
          });
        }
      }
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/inventory");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: publicActionError(error, "No se pudo actualizar el envío") };
  }
}
