import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { generateWhatsAppLink } from '@/lib/whatsapp';

export async function updateOrderStatus(orderId: string, status: 'CONFIRMADO' | 'PROCESANDO' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO') {
  try {
    const order = await prisma.pedido.findUnique({
      where: { id: orderId },
      include: { client: true }
    });

    if (!order) throw new Error('Pedido no encontrado');

    await prisma.pedido.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath('/dashboard/store');

    let message = '';
    if (status === 'CONFIRMADO') {
      message = `¡Hola ${order.client.name}! 👟 Tu pedido en Orígenes Kicks ha sido CONFIRMADO. Estamos preparando tus tenis para el envío.`;
    } else if (status === 'DESPACHADO') {
      message = `¡Buenas noticias ${order.client.name}! 🚚 Tus Kicks ya han sido DESPACHADOS y están en camino a tu dirección.`;
    }

    const whatsappLink = message ? generateWhatsAppLink(order.client.phone, message) : null;

    return { success: true, whatsappLink };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: 'No se pudo actualizar el pedido' };
  }
}


export async function getTodaysOrders(storeId?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await prisma.pedido.findMany({
    where: {
      storeId: storeId || undefined,
      createdAt: {
        gte: today,
      },
    },
    include: {
      client: {
        select: { name: true, phone: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
