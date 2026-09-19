import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { requireRole, ROLES_STAFF } from '@/lib/auth-guard';

type OrderStatus = 'CONFIRMADO' | 'PROCESANDO' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO';

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const auth = await requireRole(ROLES_STAFF);

  if (!auth.ok) {
    return { success: false, error: 'No tienes permisos para actualizar pedidos' };
  }

  if (!orderId || !status) {
    return { success: false, error: 'Datos del pedido incompletos' };
  }

  try {
    const order = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: { client: { select: { name: true, phone: true } } },
    });

    if (!order) {
      return { success: false, error: 'Pedido no encontrado' };
    }

    const user = auth.dbUser;
    if (user.role !== 'OWNER' && user.role !== 'ADMIN' && order.storeId !== user.workStoreId) {
      return { success: false, error: 'No tienes acceso a este pedido' };
    }

    const allowedTransitions: Record<string, OrderStatus[]> = {
      RECIBIDO: ['CONFIRMADO', 'CANCELADO'],
      CONFIRMADO: ['PROCESANDO', 'CANCELADO'],
      PROCESANDO: ['DESPACHADO', 'CANCELADO'],
      DESPACHADO: ['ENTREGADO'],
      ENTREGADO: [],
      CANCELADO: [],
      RECHAZADO: [],
    };

    if (!allowedTransitions[order.status]?.includes(status)) {
      return { success: false, error: 'Cambio de estado no permitido' };
    }

    await prisma.pedido.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath('/dashboard/store');

    let message = '';
    if (status === 'CONFIRMADO') {
      message = `Hola ${order.client.name}. Tu pedido en Orígenes Kicks ha sido confirmado y estamos preparando tus tenis.`;
    } else if (status === 'DESPACHADO') {
      message = `Hola ${order.client.name}. Tu pedido en Orígenes Kicks ha sido despachado.`;
    }

    const whatsappLink =
      message && order.client.phone
        ? generateWhatsAppLink(order.client.phone, message)
        : null;

    return { success: true, whatsappLink };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'No se pudo actualizar el pedido' };
  }
}

export async function getTodaysOrders(storeId?: string) {
  const auth = await requireRole(ROLES_STAFF);

  if (!auth.ok) {
    return [];
  }

  const user = auth.dbUser;
  const effectiveStoreId =
    user.role === 'OWNER' || user.role === 'ADMIN'
      ? storeId
      : user.workStoreId;

  return prisma.pedido.findMany({
    where: {
      ...(effectiveStoreId ? { storeId: effectiveStoreId } : {}),
      createdAt: { gte: startOfToday(), lt: startOfTomorrow() },
    },
    include: {
      client: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
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
