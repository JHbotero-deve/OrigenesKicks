import dotenv from "dotenv";
dotenv.config();

const DEFAULT_SECRET = "origenes-kicks-secret-cambiar-en-produccion-2025";

export const {
  PORT = 3000,
  NODE_ENV = "development",
  CORS_ORIGIN = "http://localhost:3000",
  JWT_SECRET = DEFAULT_SECRET,
  DATABASE_URL = "file:./prisma/dev.db"
} = process.env;

if (NODE_ENV === "production" && JWT_SECRET === DEFAULT_SECRET) {
  console.error("[FATAL] JWT_SECRET debe estar configurado en producción");
  process.exit(1);
}
