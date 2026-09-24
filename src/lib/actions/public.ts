import prisma from '@/lib/db';

const TRACKING_PATTERN = /^OK-[A-F0-9]{10}$/;

export async function getPublicOrderStatus(orderCode: string) {
  const normalizedCode = orderCode?.trim().toUpperCase();

  if (!normalizedCode || !TRACKING_PATTERN.test(normalizedCode)) {
    return { success: false, message: 'Código de seguimiento inválido.' };
  }

  try {
    const order = await prisma.pedido.findUnique({
      where: { trackingCode: normalizedCode },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        envio: true,
        store: { select: { phone: true, name: true } },
      },
    });

    if (!order) {
      return {
        success: false,
        message: 'Pedido no encontrado. Verifica el código de seguimiento.',
      };
    }

    return {
      success: true,
      trackingCode: order.trackingCode,
      status: order.status,
      date: order.createdAt,
      city: order.envio?.city || 'Medellín',
      storePhone: order.store?.phone || null,
      storeName: order.store?.name || null,
      items: order.items.map((item) => item.variant.product.name),
    };
  } catch (error) {
    console.error('Error fetching public order status:', error);
    return {
      success: false,
      message: 'Ocurrió un error al buscar el pedido.',
    };
  }
}
