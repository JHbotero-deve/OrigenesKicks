import express from "express";
import prisma from "../db.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { variants: { where: { stock: { gt: 0 } } } },
      orderBy: { createdAt: "desc" }
    });
    res.json({ ok: true, data: products });
  } catch (error) {
    console.error("[PRODUCTS] list:", error.message);
    res.status(500).json({ ok: false, message: "Error al obtener productos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { variants: true }
    });
    if (!product) return res.status(404).json({ ok: false, message: "Producto no encontrado." });
    res.json({ ok: true, data: product });
  } catch (error) {
    console.error("[PRODUCTS] get:", error.message);
    res.status(500).json({ ok: false, message: "Error al obtener producto." });
  }
});

router.post("/", authenticate, authorize("ADMIN", "SELLER"), async (req, res) => {
  try {
    const { name, description, basePrice, category, variants } = req.body;
    if (!name || !basePrice) {
      return res.status(400).json({ ok: false, message: "Nombre y precio base son requeridos." });
    }
    const product = await prisma.product.create({
      data: {
        name,
        description,
        basePrice: parseFloat(basePrice),
        category,
        variants: { create: variants || [] }
      },
      include: { variants: true }
    });
    res.status(201).json({ ok: true, message: "Producto creado exitosamente.", data: product });
  } catch (error) {
    console.error("[PRODUCTS] create:", error.message);
    res.status(500).json({ ok: false, message: "Error al crear producto." });
  }
});

router.put("/:id", authenticate, authorize("ADMIN", "SELLER"), async (req, res) => {
  try {
    const { name, description, basePrice, category, active } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        category,
        active
      },
      include: { variants: true }
    });
    res.json({ ok: true, message: "Producto actualizado.", data: product });
  } catch (error) {
    console.error("[PRODUCTS] update:", error.message);
    res.status(500).json({ ok: false, message: "Error al actualizar producto." });
  }
});

router.delete("/:id", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true, message: "Producto eliminado." });
  } catch (error) {
    console.error("[PRODUCTS] delete:", error.message);
    res.status(500).json({ ok: false, message: "Error al eliminar producto." });
  }
});

export default router;
