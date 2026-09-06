"use server";

import prisma from "./db";
import { revalidatePath } from "next/cache";

/**
 * Crea una nueva instancia de aplicación para un cliente.
 */
export async function createAnalizisApp(data: {
  businessName: string;
  ownerEmail: string;
  planType: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la instancia de negocio
      const instance = await tx.appInstance.create({
        data: {
          businessName: data.businessName,
          ownerEmail: data.ownerEmail,
          planType: data.planType,
          status: 'ACTIVE'
        }
      });

      // 2. Crear la licencia técnica vinculada
      await tx.appLicense.create({
        data: {
          licenseKey: `${data.businessName.toUpperCase().slice(0,3)}-${Date.now()}`,
          ownerEmail: data.ownerEmail,
          masterPin: Math.floor(1000 + Math.random() * 9000).toString(), // PIN Aleatorio de 4 dígitos
          status: 'ACTIVE'
        }
      });

      return instance;
    });

    revalidatePath('/analizis-control');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Suspende o activa una aplicación (Kill Switch)
 */
export async function toggleAppStatus(instanceId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await prisma.appInstance.update({
      where: { id: instanceId },
      data: { status: newStatus }
    });

    revalidatePath('/analizis-control');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
