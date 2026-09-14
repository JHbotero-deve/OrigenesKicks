import prisma from '@/lib/db';

export async function getPublicOrderStatus(orderCode: string) {
  try {
    // Buscamos el pedido por ID o por algún código (si implementamos códigos cortos)
    // Por ahora usamos el ID del pedido
    const order = await prisma.pedido.findUnique({
      where: { id: orderCode },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        },
        envio: true
      }
    });

    if (!order) {
      return { success: false, message: 'Pedido no encontrado. Por favor, verifica el código.' };
    }

    // Formateamos la respuesta para que la página de Posventa la entienda
    return {
      success: true,
      status: order.status,
      city: order.envio?.city || 'Colombia',
      items: order.items.map(item => \\ (\ / \)\),
    };
  } catch (error) {
    console.error('Error fetching public order status:', error);
    return { success: false, message: 'Ocurrió un error al buscar el pedido.' };
  }
}
