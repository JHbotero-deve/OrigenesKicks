"use server";

import { randomInt, randomUUID } from "node:crypto";
import prisma from "./db";
import { revalidatePath } from "next/cache";
import { requireRole, ROLES_OWNER_ONLY } from "./auth-guard";

type CreateAnalizisAppData = {
  businessName: string;
  ownerEmail: string;
  planType: string;
};

export async function createAnalizisApp(data: CreateAnalizisAppData) {
  const auth = await requireRole(ROLES_OWNER_ONLY);

  if (!auth.ok) {
    return { success: false, error: "No tienes permisos para gestionar licencias." };
  }

  const businessName = data.businessName.trim();
  const ownerEmail = data.ownerEmail.trim().toLowerCase();
  const planType = data.planType.trim();

  if (!businessName || !ownerEmail || !planType) {
    return { success: false, error: "Los datos de la licencia son obligatorios." };
  }

  try {
    const licenseKey = `${businessName.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 12)}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const masterPin = String(randomInt(1000, 10000));

    const license = await prisma.appLicense.create({
      data: {
        licenseKey,
        ownerEmail,
        masterPin,
        status: "ACTIVE",
      },
    });

    revalidatePath("/analizis-control");

    return {
      success: true,
      data: {
        id: license.id,
        licenseKey: license.licenseKey,
        ownerEmail: license.ownerEmail,
        planType,
        status: license.status,
      },
    };
  } catch (error) {
    console.error("Error al crear licencia:", error);
    return { success: false, error: "No se pudo crear la licencia." };
  }
}

export async function toggleAppStatus(licenseId: string) {
  const auth = await requireRole(ROLES_OWNER_ONLY);

  if (!auth.ok) {
    return { success: false, error: "No tienes permisos para gestionar licencias." };
  }

  if (!licenseId) {
    return { success: false, error: "Identificador de licencia inválido." };
  }

  try {
    const license = await prisma.appLicense.findUnique({
      where: { id: licenseId },
      select: { id: true, status: true },
    });

    if (!license) {
      return { success: false, error: "Licencia no encontrada." };
    }

    const newStatus = license.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    await prisma.appLicense.update({
      where: { id: license.id },
      data: { status: newStatus },
    });

    revalidatePath("/analizis-control");
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("Error al cambiar estado de licencia:", error);
    return { success: false, error: "No se pudo cambiar el estado de la licencia." };
  }
}
