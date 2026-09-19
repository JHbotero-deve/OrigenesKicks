import "server-only";

import prisma from "./db";

export async function verifyAppAccess() {
  try {
    let license = await prisma.appLicense.findFirst();

    if (!license) {
      const licenseKey = process.env.APP_LICENSE_KEY?.trim();
      const ownerEmail = process.env.APP_OWNER_EMAIL?.trim().toLowerCase();
      const masterPin = process.env.APP_MASTER_PIN?.trim();

      if (!licenseKey || !ownerEmail || !masterPin) {
        return {
          allowed: false,
          message: "La licencia no está configurada. Define APP_LICENSE_KEY, APP_OWNER_EMAIL y APP_MASTER_PIN.",
        };
      }

      license = await prisma.appLicense.create({
        data: {
          licenseKey,
          ownerEmail,
          masterPin,
          status: "ACTIVE",
        },
      });
    }

    if (license.status !== "ACTIVE") {
      return {
        allowed: false,
        message: "SERVICIO SUSPENDIDO: la licencia de la plataforma no está activa.",
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error al verificar acceso de la aplicación:", error);
    return {
      allowed: false,
      message: "No fue posible verificar la licencia de la aplicación.",
    };
  }
}
