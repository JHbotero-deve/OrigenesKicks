"use server";

import prisma from "./db";
import { revalidatePath } from "next/cache";
import { createClient } from "./supabase-server";

/**
 * 1. CREACIÓN DEL PEDIDO (Reserva de 24h)
 * Flujo: Cliente -> Vitrina -> Reserva -> Bloqueo de Stock -> Auditoría
 */
export async function createOrder(data: {
  clientId: string;
  items: { variantId: string; quantity: number; unitPrice: number }[];
  paymentMethod: string;
  totalAmount: number;
  shippingAddress?: { address: string; city: string; phone: string };
}): Promise<{ success: boolean; pedidoId?: string; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const itemsWithRealPrices = [];
      let assignedStoreId = null;

      for (const item of data.items) {
        const variant = await tx.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true, store: true }
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`¡Pilas! No hay suficiente stock para ${variant?.product.name || 'este modelo'}`);
        }

        // Asignamos el pedido a la sucursal de la primera variante (flujo simplificado)
        if (!assignedStoreId) assignedStoreId = variant.storeId;

        const price = Number(variant.product.discountPrice || variant.product.basePrice);
        calculatedTotal += price * item.quantity;

        itemsWithRealPrices.push({
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: price
        });
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const pedido = await tx.pedido.create({
        data: {
          clientId: data.clientId,
          storeId: assignedStoreId, // Vínculo real con el local
          totalAmount: calculatedTotal,
          paymentMethod: data.paymentMethod,
          status: 'RECIBIDO',
          expiresAt,
          items: {
            create: itemsWithRealPrices
          },
          ...(data.shippingAddress && {
            envio: {
              create: {
                address: data.shippingAddress.address,
                city: data.shippingAddress.city,
                phone: data.shippingAddress.phone,
                status: 'PENDIENTE'
              }
            }
          })
        }
      });

      // Reducir stock y auditar
      for (const item of data.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            storeId: assignedStoreId,
            changeType: 'RESERVATION',
            quantity: item.quantity,
            reason: `Reserva de 24h (Pedido #${pedido.id.slice(0,8)})`,
            performedById: data.clientId
          }
        });
      }

      return { success: true, pedidoId: pedido.id };
    });

    revalidatePath('/products');
    revalidatePath('/dashboard/orders');
    return result;
  } catch (error: any) {
    console.error("Error al crear pedido:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 2. APROBACIÓN Y FACTURACIÓN (Cierre de Venta)
 * Flujo: Admin -> Verifica Pago -> Genera Factura Legal -> Venta Definitiva
 */
export async function approveOrder(pedidoId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SELLER')) {
    return { success: false, error: "No tienes permiso para aprobar ventas" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const p = await tx.pedido.findUnique({
        where: { id: pedidoId },
        include: { items: { include: { variant: { include: { product: true } } } }, store: true, client: true }
      });

      if (!p || p.status !== 'RECIBIDO') throw new Error("Pedido no válido para aprobación");

      // Actualizar estado del pedido
      await tx.pedido.update({
        where: { id: pedidoId },
        data: { status: 'CONFIRMADO', expiresAt: null }
      });

      // Generar Factura con los datos del LOCAL específico
      const store = p.store;
      const nextInvoiceNumber = (store?.lastInvoiceNumber || 0) + 1;
      const prefix = store?.invoicePrefix || "FK";

      const factura = await tx.factura.create({
        data: {
          invoiceNumber: nextInvoiceNumber,
          prefix: prefix,
          fullNumber: `${prefix}-${nextInvoiceNumber}`,
          customerName: p.client.name,
          customerIdType: "CC",
          customerId: "123456789",
          customerEmail: p.client.email,
          totalAmount: p.totalAmount,
          subtotal: Number(p.totalAmount) / 1.19,
          taxAmount: Number(p.totalAmount) - (Number(p.totalAmount) / 1.19),
          paymentMethod: p.paymentMethod,
          status: 'VALIDADA',
          pedidoId: p.id,
          items: {
            create: p.items.map(item => ({
              productName: item.variant.product.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: 19,
              taxAmount: Number(item.unitPrice) * 0.19,
              lineTotal: Number(item.unitPrice) * item.quantity,
              size: item.variant.size
            }))
          }
        }
      });

      // Actualizar contador del local
      if (store) {
        await tx.store.update({
          where: { id: store.id },
          data: { lastInvoiceNumber: nextInvoiceNumber }
        });
      }

      // Registrar venta definitiva en el Kardex
      for (const item of p.items) {
        await tx.product.update({
          where: { id: item.variant.productId },
          data: { salesCount: { increment: item.quantity } }
        });

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            storeId: store?.id,
            changeType: 'SALE',
            quantity: item.quantity,
            reason: `Venta confirmada: Recibo ${factura.fullNumber}`,
            performedById: dbUser.id
          }
        });
      }
    });

    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 3. TAREAS DE MANTENIMIENTO (Liberación Automática)
 */
export async function releaseExpiredReservations() {
  const now = new Date();
  try {
    return await prisma.$transaction(async (tx) => {
      const expiredOrders = await tx.pedido.findMany({
        where: { status: 'RECIBIDO', expiresAt: { lt: now } },
        include: { items: true }
      });

      for (const order of expiredOrders) {
        for (const item of order.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });

          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,
              storeId: order.storeId,
              changeType: 'RETURN',
              quantity: item.quantity,
              reason: `Vencieron las 24h del pedido #${order.id.slice(0,8)}`,
              performedById: '00000000-0000-0000-0000-000000000000' // ID de sistema
            }
          });
        }
        await tx.pedido.update({
          where: { id: order.id },
          data: { status: 'CANCELADO', notes: 'Cancelado por falta de pago (24h).' }
        });
      }
      return { success: true, released: expiredOrders.length };
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 4. RETIROS MANUALES AUDITADOS
 */
export async function manualInventoryRemoval(data: {
  variantId: string;
  quantity: number;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autorizado" };

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') return { success: false, error: "Solo el dueño puede autorizar retiros manuales" };

  try {
    return await prisma.$transaction(async (tx) => {
      const variant = await tx.variant.findUnique({ where: { id: data.variantId }, include: { store: true } });
      if (!variant || variant.stock < data.quantity) throw new Error("Stock insuficiente");

      await tx.variant.update({ where: { id: data.variantId }, data: { stock: { decrement: data.quantity } } });

      await tx.inventoryLog.create({
        data: {
          variantId: data.variantId,
          storeId: variant.storeId,
          changeType: 'ADJUSTMENT',
          quantity: data.quantity,
          reason: data.reason,
          performedById: dbUser.id
        }
      });

      console.log(`[SEGURIDAD] ${dbUser.name} sacó ${data.quantity} pares por: ${data.reason}`);
      revalidatePath('/dashboard/inventory');
      return { success: true };
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
