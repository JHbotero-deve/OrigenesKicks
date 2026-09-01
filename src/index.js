/**
 * Orígenes Kicks - Backend API
 * Sistema de tienda de zapatos con facturación DIAN
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configuración
dotenv.config();
import { PORT, NODE_ENV, CORS_ORIGIN } from "./config/env.js";

// Rutas
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import invoiceRoutes from "./routes/invoices.js";

// Base de datos
import prisma from "./db.js";

const app = express();

// === SEGURIDAD ===

// Helmet: Headers HTTP seguros
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// CORS: Control de orígenes
const allowedOrigins = NODE_ENV === "production"
  ? CORS_ORIGIN.split(",")
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Origen no permitido por CORS"));
    }
  },
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { ok: false, message: "Demasiados intentos. Intenta en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { ok: false, message: "Demasiadas peticiones. Intenta más tarde." }
});

app.use("/api/v1/auth", authLimiter);
app.use("/api/v1", apiLimiter);

// === BODY PARSERS ===
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// === ARCHIVOS ESTÁTICOS ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// === RUTAS API ===

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    ok: true,
    status: "UP",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: "1.0.0"
  });
});

// Autenticación
app.use("/api/v1/auth", authRoutes);

// Productos
app.use("/api/v1/products", productRoutes);

// Pedidos
app.use("/api/v1/orders", orderRoutes);

// Facturación (DIAN)
app.use("/api/v1/invoices", invoiceRoutes);

// === SPA FALLBACK ===
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  console.error(err.stack);

  res.status(err.status || 500).json({
    ok: false,
    message: NODE_ENV === "development" ? err.message : "Error interno del servidor.",
    ...(NODE_ENV === "development" && { stack: err.stack })
  });
});

// === SERVER ===
const server = app.listen(PORT, () => {
  console.log(`🚀 Orígenes Kicks API corriendo en http://localhost:${PORT}`);
  console.log(`📦 Entorno: ${NODE_ENV}`);
  console.log(`📋 Rutas disponibles:`);
  console.log(`   - /api/v1/health`);
  console.log(`   - /api/v1/auth`);
  console.log(`   - /api/v1/products`);
  console.log(`   - /api/v1/orders`);
  console.log(`   - /api/v1/invoices`);
});

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\n[INFO] Recibida señal ${signal}. Cerrando servidor...`);
  
  server.close(async () => {
    console.log("[INFO] Servidor HTTP cerrado.");
    
    // Cerrar conexión a la base de datos
    await prisma.$disconnect();
    console.log("[INFO] Conexión a BD cerrada.");
    
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error("[ERROR] Forzando apagado...");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
