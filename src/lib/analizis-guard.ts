import prisma from "./db";

/**
 * AGENTE DE SEGURIDAD ANALIZISESTUDIO
 * Verifica y auto-activa la plataforma si es la primera ejecución.
 */
export async function verifyAppAccess() {
  try {
    let license = await prisma.appLicense.findFirst();

    // AUTO-ACTIVACIÓN (Solo se ejecuta una vez en la vida del proyecto)
    if (!license) {
      console.log("🛠️ AnalizisEstudio: Detectada primera ejecución. Activando núcleo...");

      license = await prisma.appLicense.create({
        data: {
          licenseKey: 'OK-2026-PRO',
          ownerEmail: 'admin@origeneskicks.com',
          masterPin: '2026',
          status: 'ACTIVE',
        }
      });

      // Crear sucursal inicial por defecto
      await prisma.store.upsert({
        where: { id: 'default-store-id' },
        update: {},
        create: {
          id: 'default-store-id',
          name: 'Orígenes Kicks - Sede Principal',
          address: 'Calle del Barrio #123',
          city: 'Medellín',
          phone: '573000000000',
          active: true,
          invoicePrefix: 'OK',
          lastInvoiceNumber: 0
        },
      });

      console.log("✅ AnalizisEstudio: Núcleo activado con éxito.");
    }

    if (license.status !== 'ACTIVE') {
      return {
        allowed: false,
        message: "SERVICIO SUSPENDIDO: Comunícate con AnalizisEstudio para reactivar tu plataforma."
      };
    }

    return { allowed: true };
  } catch (error: any) {
    console.error("❌ Error de seguridad:", error.message);
    // Si la tabla no existe aún, necesitamos que el usuario corra el npx prisma db push
    return { allowed: false, message: "La base de datos no está lista. Ejecuta 'npx prisma db push' en tu terminal." };
  }
}
