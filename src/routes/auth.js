import express from "express";
import bcrypt from "bcrypt";
import prisma from "../db.js";
import { generateToken, verifyToken, cookieOptions } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, message: "Nombre, email y contraseña son requeridos." });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: "La contraseña debe tener al menos 6 caracteres." });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ ok: false, message: "Este email ya está registrado." });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "CLIENT" }
    });
    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      ok: true,
      message: "Usuario registrado exitosamente.",
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error("[AUTH] register:", error.message);
    res.status(500).json({ ok: false, message: "Error al registrar usuario." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Email y contraseña son requeridos." });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ ok: false, message: "Credenciales incorrectas." });
    }
    const token = generateToken(user);
    res.cookie("token", token, cookieOptions);
    res.json({
      ok: true,
      message: "Inicio de sesión exitoso.",
      data: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error("[AUTH] login:", error.message);
    res.status(500).json({ ok: false, message: "Error al iniciar sesión." });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ ok: true, message: "Sesión cerrada exitosamente." });
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado." });
    res.json({ ok: true, data: user });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error al obtener usuario." });
  }
});

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, message: "No autenticado." });
  }
  try {
    req.user = verifyToken(header.split(" ")[1]);
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Token inválido." });
  }
}

export default router;
