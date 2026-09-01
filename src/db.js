import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
});

prisma.$connect()
  .then(() => console.log("[DB] Conexión a Prisma establecida"))
  .catch((err) => console.error("[DB] Error de conexión:", err.message));

export default prisma;
