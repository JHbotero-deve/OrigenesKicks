"use server";

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireRole, ROLES_DISPATCH } from '@/lib/auth-guard';

type OrderStatus = 'CONFIRMADO' | 'PROCESANDO' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO';

export type StoreOrder = {
  id: string;
  status: 'RECIBIDO' | 'CONFIRMADO' | 'PROCESANDO' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO' | 'RECHAZADO';
  client: { name: string | null };
};

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const auth = await requireRole(ROLES_DISPATCH);

  if (!auth.ok) {
    return { success: false, error: 'No tienes permisos para actualizar pedidos' };
  }

  if (!orderId || !status) {
    return { success: false, error: 'Datos del pedido incompletos' };
  }

  try {
    const order = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: { client: { select: { name: true } } },
    });

    if (!order) {
      return { success: false, error: 'Pedido no encontrado' };
    }

    const user = auth.dbUser;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN' && order.storeId !== user.workStoreId) {
      return { success: false, error: 'No tienes acceso a este pedido' };
    }

    const managerTransitions: Record<string, OrderStatus[]> = {
      RECIBIDO: ['CONFIRMADO', 'CANCELADO'],
      CONFIRMADO: ['PROCESANDO', 'CANCELADO'],
      PROCESANDO: ['DESPACHADO', 'CANCELADO'],
      DESPACHADO: ['ENTREGADO'],
      ENTREGADO: [],
      CANCELADO: [],
      RECHAZADO: [],
    };
    const dispatchTransitions: Record<string, OrderStatus[]> = {
      RECIBIDO: [],
      CONFIRMADO: [],
      PROCESANDO: ['DESPACHADO'],
      DESPACHADO: ['ENTREGADO'],
      ENTREGADO: [],
      CANCELADO: [],
      RECHAZADO: [],
    };
    const allowedTransitions =
      user.role === 'OWNER' || user.role === 'ADMIN'
        ? managerTransitions
        : dispatchTransitions;

    if (!allowedTransitions[order.status]?.includes(status)) {
      return { success: false, error: 'Cambio de estado no permitido' };
    }

    let invoice: { id: string; fullNumber: string } | null = null;

    if (status === 'CONFIRMADO' && order.status === 'RECIBIDO') {
      const result = await prisma.$transaction(async (tx) => {
        if (order.status !== 'RECIBIDO') {
          throw new Error('El pedido ya fue procesado.');
        }

        return confirmOrderAsSale(tx, order.id, user.id);
      });

      if (!result.success) {
        return { success: false, error: 'No se pudo registrar la venta y generar la factura' };
      }

      invoice = {
        id: result.invoiceId,
        fullNumber: result.fullNumber,
      };
    } else {
      await prisma.pedido.update({
        where: { id: orderId },
        data: { status },
      });
    }

    revalidatePath('/dashboard/store');
    revalidatePath('/dashboard/inventory');
    revalidatePath('/products');

    return {
      success: true,
      whatsappLink: null,
      invoice,
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'No se pudo actualizar el pedido' };
  }
}

export async function getTodaysOrders(storeId?: string): Promise<StoreOrder[]> {
  const auth = await requireRole(ROLES_DISPATCH);

  if (!auth.ok) {
    return [];
  }

  const user = auth.dbUser;
  const effectiveStoreId =
    user.role === 'OWNER' || user.role === 'ADMIN'
      ? storeId
      : user.workStoreId;

  const orders = await prisma.pedido.findMany({
    where: {
      ...(effectiveStoreId ? { storeId: effectiveStoreId } : {}),
      createdAt: { gte: startOfToday(), lt: startOfTomorrow() },
    },
    select: {
      id: true,
      status: true,
      client: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfTomorrow() {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
}

