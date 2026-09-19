"use server";

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireRole, ROLES_STAFF } from '@/lib/auth-guard';

export async function adjustInventory(data: {
  variantId: string;
  quantity: number;
  reason: string;
  storeId?: string;
}) {
  const auth = await requireRole(ROLES_STAFF);

  if (!auth.ok) {
    return { success: false, error: 'No tienes permisos para ajustar el inventario' };
  }

  const quantity = Number(data.quantity);
  const reason = data.reason?.trim();

  if (!data.variantId || !Number.isInteger(quantity) || quantity === 0) {
    return { success: false, error: 'La cantidad debe ser un entero diferente de cero' };
  }

  if (Math.abs(quantity) > 100000) {
    return { success: false, error: 'La cantidad del ajuste excede el límite permitido' };
  }

  if (!reason || reason.length < 3 || reason.length > 500) {
    return { success: false, error: 'La razón del ajuste es obligatoria y debe tener entre 3 y 500 caracteres' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const variant = await tx.variant.findUnique({
        where: { id: data.variantId },
        select: { id: true, stock: true, storeId: true },
      });

      if (!variant) {
        throw new Error('Variante de producto no encontrada');
      }

      const user = auth.dbUser;
      const effectiveStoreId =
        user.role === 'OWNER' || user.role === 'ADMIN'
          ? data.storeId ?? variant.storeId
          : user.workStoreId;

      if (!effectiveStoreId || variant.storeId !== effectiveStoreId) {
        throw new Error('La variante no pertenece a la tienda autorizada');
      }

      if (quantity < 0 && variant.stock < Math.abs(quantity)) {
        throw new Error('Stock insuficiente para realizar este retiro');
      }

      const update = await tx.variant.updateMany({
        where: {
          id: variant.id,
          storeId: effectiveStoreId,
          ...(quantity < 0 ? { stock: { gte: Math.abs(quantity) } } : {}),
        },
        data: { stock: { increment: quantity } },
      });

      if (update.count !== 1) {
        throw new Error('El stock cambió durante el ajuste. Inténtalo nuevamente');
      }

      await tx.inventoryLog.create({
        data: {
          variantId: variant.id,
          storeId: effectiveStoreId,
          changeType: 'ADJUSTMENT',
          quantity,
          reason,
          performedById: user.id,
        },
      });
    });

    revalidatePath('/dashboard/inventory');
    revalidatePath('/dashboard/store');
    revalidatePath('/products');

    return { success: true };
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo ajustar el inventario',
    };
  }
}
