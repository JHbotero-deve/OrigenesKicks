import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * GESTIÓN DE AJUSTES DE INVENTARIO (NO VENTAS)
 * Para registrar pérdidas, daños, robos o devoluciones.
 */

export async function adjustInventory(data: {
  variantId: string,
  quantity: number, // Negativo para pérdida, positivo para entrada
  reason: string,
  userId: string,
  storeId: string
}) {
  try {
    return await prisma.\(async (tx) => {
      // 1. Actualizar el stock de la variante
      await tx.variant.update({
        where: { id: data.variantId },
        data: {
          stock: { increment: data.quantity }
        }
      });

      // 2. Crear el log del movimiento
      // Definimos el tipo basado en el signo de la cantidad
      const changeType = data.quantity < 0 ? 'ADJUSTMENT' : 'PURCHASE';

      await tx.inventoryLog.create({
        data: {
          variantId: data.variantId,
          storeId: data.storeId,
          changeType: changeType,
          quantity: data.quantity,
          reason: data.reason,
          performedById: data.userId,
        }
      });

      revalidatePath('/dashboard/store');
      return { success: true };
    });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return { success: false, error: 'No se pudo ajustar el inventario' };
  }
}
