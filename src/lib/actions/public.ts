import prisma from '@/lib/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPublicOrderStatus(orderCode: string) {
  const normalizedCode = orderCode?.trim();

  if (!normalizedCode || !UUID_PATTERN.test(normalizedCode)) {
    return { success: false, message: 'Código de pedido inválido.' };
  }

  try {
    const order = await prisma.pedido.findUnique({
      where: { id: normalizedCode },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        envio: true,
      },
    });

    if (!order) {
      return {
        success: false,
        message: 'Pedido no encontrado. Por favor, verifica el código.',
      };
    }

    return {
      success: true,
      status: order.status,
      city: order.envio?.city || 'Colombia',
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
