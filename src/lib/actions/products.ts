"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireRole, ROLES_MANAGE_CATALOG } from "@/lib/auth-guard";

const ProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  basePrice: z.number().finite().positive(),
  discountPrice: z.number().finite().positive().nullable().optional(),
  category: z.string().trim().max(80).optional(),
  gender: z.enum(["HOMBRE","MUJER","UNISEX"]),
  usage: z.enum(["DEPORTE","DIARIO","TRABAJO","URBANO"]),
  imageUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  model3dUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  sku: z.string().trim().max(80).optional(),
  taxRate: z.number().min(0).max(100),
  variants: z.array(z.object({
    size: z.string().trim().min(1).max(20),
    color: z.string().trim().min(1).max(60),
    stock: z.number().int().min(0).max(100000),
  })).min(1).max(100),
});

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function createProduct(data: unknown) {
  const auth = await requireRole(ROLES_MANAGE_CATALOG);
  if (!auth.ok) return { success: false, error: "No tienes permisos para crear productos" };

  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message || "Datos del producto inválidos" };

  const input = parsed.data;
  const discountPrice = input.discountPrice && input.discountPrice < input.basePrice ? input.discountPrice : null;
  const baseSlug = slugify(input.name);
  let slug = baseSlug || `producto-${Date.now()}`;
  let suffix = 1;

  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const duplicateSku = input.sku ? await prisma.product.findFirst({ where: { sku: input.sku }, select: { id: true } }) : null;
  if (duplicateSku) return { success: false, error: "El SKU del producto ya existe" };

  const seen = new Set<string>();
  for (const variant of input.variants) {
    const key = `${variant.size}|${variant.color}`.toLowerCase();
    if (seen.has(key)) return { success: false, error: "No puedes repetir talla y color en el mismo producto" };
    seen.add(key);
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description || null,
        basePrice: input.basePrice,
        discountPrice,
        category: input.category || null,
        gender: input.gender,
        usage: input.usage,
        imageUrl: input.imageUrl || null,
        model3dUrl: input.model3dUrl || null,
        sku: input.sku || null,
        taxRate: input.taxRate,
        variants: {
          create: input.variants.map((variant, index) => ({
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            sku: `${input.sku || slug}-${variant.size}-${index + 1}`.toUpperCase().replace(/[^A-Z0-9-]/g, "-"),
          })),
        },
      },
      select: { id: true, name: true },
    });

    revalidatePath("/products");
    revalidatePath("/dashboard/inventory");
    return { success: true, product };
  } catch (error) {
    console.error("Error creando producto:", error);
    return { success: false, error: "No se pudo crear el producto. Verifica que los datos no estén duplicados." };
  }
}
