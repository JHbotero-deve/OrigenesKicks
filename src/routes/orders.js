import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../db.js";
import { authenticate, authorize, verifyToken } from "../middleware/auth.js";

const router = express.Router();

function getClientIdFromToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  try {
    return verifyToken(header.split(" ")[1]).id;
  } catch {
    return null;
  }
}

router.get("/", authenticate, authorize("ADMIN", "SELLER"), async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.clientId) where.clientId = req.query.clientId;
    const orders = await prisma.pedido.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        items: { include: { variant: { include: { product: true } } } },
        envio: true,
        invoice: { select: { id: true, fullNumber: true, status: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ ok: true, data: orders });
  } catch (error) {
    console.error("[ORDERS] list:", error.message);
    res.status(500).json({ ok: false, message: "Error al obtener pedidos." });
  }
});

router.get("/my", authenticate, async (req, res) => {
  try {
    const orders = await prisma.pedido.findMany({
      where: { clientId: req.user.id },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        envio: true,
        invoice: { select: { id: true, fullNumber: true, status: true, totalAmount: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ ok: true, data: orders });
  } catch (error) {
    console.error("[ORDERS] my:", error.message);
    res.status(500).json({ ok: false, message: "Error al obtener tus pedidos." });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await prisma.pedido.findUnique({
      where: { id: req.params.id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        items: { include: { variant: { include: { product: true } } } },
        envio: true,
        invoice: true
      }
    });
    if (!order) return res.status(404).json({ ok: false, message: "Pedido no encontrado." });
    if (order.clientId !== req.user.id && !["ADMIN", "SELLER"].includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: "No tienes acceso a este pedido." });
    }
    res.json({ ok: true, data: order });
  } catch (error) {
    console.error("[ORDERS] get:", error.message);
    res.status(500).json({ ok: false, message: "Error al obtener el pedido." });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      items, paymentMethod, shippingAddress, shippingCity, shippingPhone,
      customerName, customerIdType, customerId, customerEmail, notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ ok: false, message: "El carrito está vacío." });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });
      if (!variant) {
        return res.status(400).json({ ok: false, message: `Variante no encontrada: ${item.variantId}` });
      }
      if (variant.stock < item.quantity) {
        return res.status(400).json({ ok: false, message: `Stock insuficiente para ${variant.product.name} (Talla ${variant.size})` });
      }
      await prisma.variant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } }
      });
      const unitPrice = parseFloat(variant.product.basePrice);
      totalAmount += unitPrice * item.quantity;
      orderItems.push({ variantId: item.variantId, quantity: item.quantity, unitPrice });
    }

    let clientId = getClientIdFromToken(req);
    if (!clientId) {
      const email = customerEmail || `anon_${Date.now()}@origeneskicks.local`;
      let anon = await prisma.user.findFirst({ where: { email } });
      if (!anon) {
        const hashed = await bcrypt.hash(crypto.randomUUID(), 10);
        anon = await prisma.user.create({
          data: { email, name: customerName || "Cliente", password: hashed, role: "CLIENT" }
        });
      }
      clientId = anon.id;
    }

    const order = await prisma.pedido.create({
      data: {
        clientId,
        totalAmount,
        paymentMethod: paymentMethod || "CONTRA_ENTREGA",
        status: "RECIBIDO",
        notes,
        items: { create: orderItems },
        ...(shippingAddress && {
          envio: {
            create: {
              address: shippingAddress,
              city: shippingCity || "Bogotá",
              phone: shippingPhone,
              status: "PENDIENTE"
            }
          }
        })
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        envio: true
      }
    });

    res.status(201).json({
      ok: true,
      message: "Pedido creado exitosamente.",
      data: { id: order.id, totalAmount: order.totalAmount, status: order.status, itemsCount: order.items.length }
    });
  } catch (error) {
    console.error("[ORDERS] create:", error.message);
    res.status(500).json({ ok: false, message: "Error al crear el pedido." });
  }
});

router.put("/:id/status", authenticate, authorize("ADMIN", "SELLER"), async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["RECIBIDO", "CONFIRMADO", "PROCESANDO", "DESPACHADO", "ENTREGADO", "RECHAZADO", "CANCELADO"];
    if (!valid.includes(status)) {
      return res.status(400).json({ ok: false, message: "Estado inválido." });
    }
    const order = await prisma.pedido.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true, envio: true }
    });
    if (status === "CANCELADO" || status === "RECHAZADO") {
      for (const item of order.items) {
        await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } }
        });
      }
    }
    res.json({ ok: true, message: `Pedido actualizado a: ${status}`, data: order });
  } catch (error) {
    console.error("[ORDERS] status:", error.message);
    res.status(500).json({ ok: false, message: "Error al actualizar el pedido." });
  }
});

router.put("/:id/shipping", authenticate, authorize("ADMIN", "SELLER"), async (req, res) => {
  try {
    const { address, city, department, phone, trackingNumber, deliveryDate, status, notes } = req.body;
    const order = await prisma.pedido.findUnique({
      where: { id: req.params.id },
      include: { envio: true }
    });
    if (!order) return res.status(404).json({ ok: false, message: "Pedido no encontrado." });

    let envio;
    if (order.envio) {
      envio = await prisma.envio.update({
        where: { id: order.envio.id },
        data: {
          ...(address && { address }),
          ...(city && { city }),
          ...(department && { department }),
          ...(phone && { phone }),
          ...(trackingNumber && { trackingNumber }),
          ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
          ...(status && { status }),
          ...(notes && { notes })
        }
      });
    } else if (address) {
      envio = await prisma.envio.create({
        data: { pedidoId: req.params.id, address, city: city || "Bogotá", department, phone, status: "PENDIENTE" }
      });
    }
    res.json({ ok: true, message: "Información de envío actualizada.", data: envio });
  } catch (error) {
    console.error("[ORDERS] shipping:", error.message);
    res.status(500).json({ ok: false, message: "Error al actualizar el envío." });
  }
});

export default router;
