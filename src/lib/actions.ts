"use server";

import prisma from "./db";
import { revalidatePath } from "next/cache";
import { createClient } from "./supabase-server";

/**
 * Crea un nuevo pedido y reserva el inventario por 24 horas.
 * Si el pago no se confirma en este tiempo, el stock vuelve a la vitrina.
 */
export async function createOrder(data: {
  clientId: string;
  items: { variantId: string; quantity: number; unitPrice: number }[];
  paymentMethod: string;
  totalAmount: number;
  shippingAddress?: { address: string; city: string; phone: string };
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Crear el Pedido
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const pedido = await tx.pedido.create({
        data: {
          clientId: data.clientId,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          status: 'RECIBIDO',
          expiresAt,
          items: {
            create: data.items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            }))
          },
          // Si hay datos de envío, crear el registro de Envio
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

      // 2. Reducir el stock de cada variante (sacar de la vitrina)
      for (const item of data.items) {
        const variant = await tx.variant.findUnique({
          where: { id: item.variantId }
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Stock insuficiente para la variante ${item.variantId}`);
        }

        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });

        // Registrar la reserva en el Log de Inventario
        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            changeType: 'RESERVATION',
            quantity: item.quantity,
            reason: `Reserva temporal de vitrina (Pedido #${pedido.id})`,
            performedBy: 'SYSTEM'
          }
        });
      }

      // 3. Simular envío de constancia al cliente
      console.log(`[MAIL] Enviando constancia de reserva para el pedido ${pedido.id} a ${data.clientId}`);
      // Aquí se integraría Resend, SendGrid o AWS SES

      revalidatePath('/products');
      return { success: true, pedidoId: pedido.id };
    });
  } catch (error: any) {
    console.error("Error al crear pedido:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Aprueba una venta. El producto queda marcado definitivamente como vendido.
 * Solo ADMIN o SELLER pueden realizar esta acción.
 */
export async function approveOrder(pedidoId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "No autorizado" };

  // Obtener rol del usuario desde nuestra DB
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SELLER')) {
    return { success: false, error: "Permisos insuficientes" };
  }

  try {
    const pedido = await prisma.$transaction(async (tx) => {
      const p = await tx.pedido.update({
        where: { id: pedidoId },
        data: {
          status: 'CONFIRMADO',
          expiresAt: null // Ya no expira
        },
        include: { items: { include: { variant: true } } }
      });

      // Incrementar el contador de ventas de cada producto vendido
      for (const item of p.items) {
        await tx.product.update({
          where: { id: item.variant.productId },
          data: { salesCount: { increment: item.quantity } }
        });

        // Registrar el movimiento en el Log de Inventario
        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            changeType: 'SALE',
            quantity: item.quantity,
            reason: `Venta confirmada (Pedido #${p.id})`,
            performedBy: user.email!
          }
        });
      }

      return p;
    });

    revalidatePath('/dashboard/orders');
    revalidatePath('/products');
    return { success: true, pedido };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Tarea de mantenimiento: Libera el stock de pedidos que no fueron aprobados en 24h.
 * Esto debería ejecutarse mediante un cron job o al cargar la vitrina.
 */
export async function releaseExpiredReservations() {
  const now = new Date();

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Encontrar pedidos expirados que aún están 'RECIBIDO'
      const expiredOrders = await tx.pedido.findMany({
        where: {
          status: 'RECIBIDO',
          expiresAt: { lt: now }
        },
        include: { items: true }
      });

      if (expiredOrders.length === 0) return { success: true, released: 0 };

      for (const order of expiredOrders) {
        // 2. Devolver stock a la vitrina
        for (const item of order.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });

          // Registrar el retorno de stock
          await tx.inventoryLog.create({
            data: {
              variantId: item.variantId,
              changeType: 'EXPIRATION_RETURN',
              quantity: item.quantity,
              reason: `Retorno automático a vitrina por expiración de 24h (Pedido #${order.id})`,
              performedBy: 'SYSTEM'
            }
          });
        }

        // 3. Marcar pedido como cancelado por expiración
        await tx.pedido.update({
          where: { id: order.id },
          data: { status: 'CANCELADO', notes: 'Cancelado automáticamente por falta de pago (24h).' }
        });
      }

      revalidatePath('/products');
      return { success: true, released: expiredOrders.length };
    });
  } catch (error: any) {
    console.error("Error al liberar reservas:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Retiro manual de inventario con justificación obligatoria.
 * Registra quién lo hizo y envía alerta por correo.
 */
export async function manualInventoryRemoval(data: {
  variantId: string;
  quantity: number;
  reason: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "No autorizado" };

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SELLER')) {
    return { success: false, error: "Permisos insuficientes" };
  }

  if (!data.reason || data.reason.trim().length < 5) {
    return { success: false, error: "La justificación es obligatoria y debe ser descriptiva." };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const variant = await tx.variant.findUnique({
        where: { id: data.variantId },
        include: { product: true }
      });

      if (!variant || variant.stock < data.quantity) {
        throw new Error("Stock insuficiente o producto no encontrado");
      }

      // 1. Actualizar Stock
      await tx.variant.update({
        where: { id: data.variantId },
        data: { stock: { decrement: data.quantity } }
      });

      // 2. Crear Log de Auditoría
      await tx.inventoryLog.create({
        data: {
          variantId: data.variantId,
          changeType: 'MANUAL_REMOVAL',
          quantity: data.quantity,
          reason: data.reason,
          performedBy: user.email!
        }
      });

      // 3. Alerta de Seguridad "Inevitable" al Administrador
      console.log(`[SECURITY ALERT] El usuario ${user.email} ha retirado ${data.quantity} unidades de ${variant.product.name} (Talla: ${variant.size}).`);
      console.log(`[MOTIVO]: ${data.reason}`);
      console.log(`[FECHA/HORA]: ${new Date().toLocaleString()}`);

      revalidatePath('/dashboard/inventory');
      revalidatePath('/products');

      return { success: true };
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

