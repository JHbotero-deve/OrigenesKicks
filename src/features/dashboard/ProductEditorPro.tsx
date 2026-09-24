"use client";

import { useState } from "react";
import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";

const sizes = ["35","36","37","38","39","40","41","42","43","44","45"];

type VariantDraft = { size: string; color: string; stock: string };

export function ProductEditorPro() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("UNISEX");
  const [usage, setUsage] = useState("DIARIO");
  const [imageUrl, setImageUrl] = useState("");
  const [model3dUrl, setModel3dUrl] = useState("");
  const [sku, setSku] = useState("");
  const [taxRate, setTaxRate] = useState("19");
  const [variants, setVariants] = useState<VariantDraft[]>([{ size: "40", color: "", stock: "0" }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updateVariant = (index: number, key: keyof VariantDraft, value: string) => {
    setVariants((current) => current.map((variant, position) => (
      position === index ? { ...variant, [key]: value } : variant
    )));
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setBasePrice("");
    setDiscountPrice("");
    setCategory("");
    setGender("UNISEX");
    setUsage("DIARIO");
    setImageUrl("");
    setModel3dUrl("");
    setSku("");
    setTaxRate("19");
    setVariants([{ size: "40", color: "", stock: "0" }]);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await createProduct({
        name,
        description,
        basePrice: Number(basePrice),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        category,
        gender,
        usage,
        imageUrl,
        model3dUrl,
        sku,
        taxRate: Number(taxRate),
        variants: variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          stock: Number(variant.stock),
        })),
      });

      if (result.success) {
        setMessage("Producto creado correctamente.");
        resetForm();
      } else {
        setMessage(result.error || "No se pudo crear el producto.");
      }
    } catch {
      setMessage("No se pudo crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-black uppercase italic">Nuevo producto</h1>
        <p className="text-sm text-gray-500">Crea el producto y sus variantes directamente en la base de datos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del producto" className="rounded-xl border p-3" />
        <input value={sku} onChange={(event) => setSku(event.target.value)} placeholder="SKU general" className="rounded-xl border p-3" />
        <input required type="number" min="1" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} placeholder="Precio base" className="rounded-xl border p-3" />
        <input type="number" min="1" value={discountPrice} onChange={(event) => setDiscountPrice(event.target.value)} placeholder="Precio oferta (opcional)" className="rounded-xl border p-3" />
        <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Categoría" className="rounded-xl border p-3" />
        <input type="number" min="0" max="100" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} placeholder="IVA %" className="rounded-xl border p-3" />
        <select value={gender} onChange={(event) => setGender(event.target.value)} className="rounded-xl border p-3">
          <option value="UNISEX">Unisex</option>
          <option value="HOMBRE">Hombre</option>
          <option value="MUJER">Mujer</option>
        </select>
        <select value={usage} onChange={(event) => setUsage(event.target.value)} className="rounded-xl border p-3">
          <option value="DIARIO">Diario</option>
          <option value="DEPORTE">Deporte</option>
          <option value="URBANO">Urbano</option>
          <option value="TRABAJO">Trabajo</option>
        </select>
        <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="URL de imagen" className="rounded-xl border p-3 md:col-span-2" />
        <input value={model3dUrl} onChange={(event) => setModel3dUrl(event.target.value)} placeholder="URL modelo 3D .glb (opcional)" className="rounded-xl border p-3 md:col-span-2" />
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descripción" className="min-h-24 rounded-xl border p-3 md:col-span-2" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-black uppercase">Tallas, color y stock</h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setVariants((current) => [...current, { size: "40", color: "", stock: "0" }])}>
            + Talla
          </Button>
        </div>

        {variants.map((variant, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-[140px_1fr_140px_auto]">
            <select value={variant.size} onChange={(event) => updateVariant(index, "size", event.target.value)} className="rounded-xl border p-3">
              {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <input required value={variant.color} onChange={(event) => updateVariant(index, "color", event.target.value)} placeholder="Color" className="rounded-xl border p-3" />
            <input required type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, "stock", event.target.value)} placeholder="Stock" className="rounded-xl border p-3" />
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants((current) => current.filter((_, position) => position !== index))} disabled={variants.length === 1}>
              Quitar
            </Button>
          </div>
        ))}
      </div>

      {message && <p className={message.startsWith("Producto creado") ? "text-green-600" : "text-red-600"}>{message}</p>}

      <Button type="submit" disabled={loading} className="w-full py-5">
        {loading ? "Guardando..." : "Crear producto"}
      </Button>
    </form>
  );
}
