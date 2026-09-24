"use client";

import React, { useState } from "react";
import { Camera, Sparkles, ImageIcon, Plus, Trash2, Box } from "lucide-react";
import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";

const sizes = ["35","36","37","38","39","40","41","42","43","44","45"];
type VariantDraft = { size: string; color: string; stock: string };

export const ProductEditorPro = () => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [sku, setSku] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [model3dUrl, setModel3dUrl] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([{ size: "40", color: "", stock: "0" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const updateVariant = (index: number, field: keyof VariantDraft, value: string) => {
    setVariants((current) => current.map((variant, position) =>
      position === index ? { ...variant, [field]: value } : variant,
    ));
  };

  const resetForm = () => {
    setProductName(""); setDescription(""); setBasePrice(""); setDiscountPrice("");
    setSku(""); setImageUrl(""); setModel3dUrl(""); setPreviewUrl("");
    setVariants([{ size: "40", color: "", stock: "0" }]);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const validVariants = variants.filter((variant) =>
        variant.size.trim() && variant.color.trim() &&
        Number.isInteger(Number(variant.stock)) && Number(variant.stock) >= 0,
      );

      if (productName.trim().length < 2) throw new Error("Debes ingresar el nombre del producto.");
      if (!basePrice || Number(basePrice) <= 0) throw new Error("Debes ingresar un precio base válido.");
      if (discountPrice && (Number(discountPrice) <= 0 || Number(discountPrice) >= Number(basePrice))) {
        throw new Error("El precio de descuento debe ser menor al precio base.");
      }
      if (!validVariants.length) throw new Error("Debes agregar al menos una variante con talla, color y stock.");
      if (imageUrl && !/^https?:\/\/.+/i.test(imageUrl.trim())) throw new Error("La URL de imagen no es válida.");
      if (model3dUrl && !/^https?:\/\/.+/i.test(model3dUrl.trim())) throw new Error("La URL del modelo 3D no es válida.");

      const result = await createProduct({
        name: productName.trim(),
        description: description.trim(),
        basePrice: Number(basePrice),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        imageUrl: imageUrl.trim(),
        model3dUrl: model3dUrl.trim(),
        sku: sku.trim(),
        variants: validVariants.map((variant) => ({
          size: variant.size.trim(),
          color: variant.color.trim(),
          stock: Number(variant.stock),
        })),
      });

      if (!result.success) throw new Error(result.error || "No se pudo crear el producto.");
      setMessage("Producto creado correctamente.");
      resetForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  const displayedPrice = discountPrice && Number(discountPrice) > 0
    ? Number(discountPrice)
    : Number(basePrice) > 0 ? Number(basePrice) : 349900;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-8 rounded-[2.5rem] border border-gray-100 bg-white p-5 shadow-2xl sm:p-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Nuevo lanzamiento</h2>
            <p className="text-sm text-gray-500">Crea el producto, sus tallas, stock, foto y modelo 3D real.</p>
          </div>

          <label className="block"><span className="field-label">Nombre del modelo</span><input value={productName} onChange={(e)=>setProductName(e.target.value)} placeholder="Ej. Orígenes Barrio 01" required className="field-input" /></label>
          <label className="block"><span className="field-label">Descripción</span><textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} maxLength={1000} className="field-input resize-none" /></label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block"><span className="field-label">Precio base</span><input type="number" min="1" step="1" value={basePrice} onChange={(e)=>setBasePrice(e.target.value)} required className="field-input" /></label>
            <label className="block"><span className="field-label">Precio descuento</span><input type="number" min="1" step="1" value={discountPrice} onChange={(e)=>setDiscountPrice(e.target.value)} className="field-input" /></label>
          </div>

          <label className="block"><span className="field-label">SKU base</span><input value={sku} onChange={(e)=>setSku(e.target.value)} maxLength={80} className="field-input uppercase" placeholder="OK-BARRIO-01" /></label>
          <label className="block"><span className="field-label">URL pública de la imagen</span><input type="url" value={imageUrl} onChange={(e)=>{setImageUrl(e.target.value); if(e.target.value) setPreviewUrl(e.target.value)}} maxLength={1000} className="field-input" placeholder="https://..." /></label>

          <label className="block">
            <span className="field-label flex items-center gap-2"><Box size={13}/> URL pública del modelo 3D (GLB/GLTF)</span>
            <input type="url" value={model3dUrl} onChange={(e)=>setModel3dUrl(e.target.value)} maxLength={1000} className="field-input" placeholder="https://.../modelo.glb" />
            <span className="mt-1 block text-[9px] text-gray-400">Debe ser accesible públicamente por HTTPS. El visor usa el archivo 3D real.</span>
          </label>

          <div className="relative cursor-pointer rounded-3xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-orange-500">
            <input type="file" className="absolute inset-0 cursor-pointer opacity-0" accept="image/*" onChange={handleImageChange} />
            <Camera className="mx-auto mb-2 text-orange-600" />
            <p className="text-xs font-black uppercase">Toca para previsualizar una foto</p>
            <p className="text-[9px] text-gray-400">La publicación definitiva usa la URL pública indicada arriba.</p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between"><span className="field-label">Variantes</span><button type="button" onClick={()=>setVariants(v=>[...v,{size:"40",color:"",stock:"0"}])} className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-600"><Plus size={14}/>Agregar</button></div>
            <div className="space-y-3">
              {variants.map((variant,index)=>(
                <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                  <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1.2fr_0.8fr_auto]">
                    <label><span className="field-label">Talla</span><select value={variant.size} onChange={(e)=>updateVariant(index,"size",e.target.value)} className="field-input">{sizes.map(size=><option key={size}>{size}</option>)}</select></label>
                    <label><span className="field-label">Color</span><input value={variant.color} onChange={(e)=>updateVariant(index,"color",e.target.value)} placeholder="Negro" maxLength={60} className="field-input" /></label>
                    <label><span className="field-label">Stock</span><input type="number" min="0" max="100000" value={variant.stock} onChange={(e)=>updateVariant(index,"stock",e.target.value)} className="field-input" /></label>
                    <button type="button" disabled={variants.length===1} onClick={()=>setVariants(v=>v.filter((_,i)=>i!==index))} className="rounded-xl p-3 text-red-500 disabled:opacity-30" aria-label="Eliminar variante"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50 p-6 sm:min-h-[500px] sm:p-8">
          <div className="absolute left-4 top-4 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-orange-600"><Sparkles size={14}/>Vista previa</div>
          {previewUrl ? (
            <div className="w-full max-w-sm">
              <div className="rounded-[2rem] bg-white p-5 shadow-xl">
                <div className="mb-5 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-50"><img src={previewUrl} alt="Vista previa" className="h-full w-full object-contain" /></div>
                <h3 className="text-xl font-black uppercase italic leading-none">{productName || "Nombre del Kick"}</h3>
                <p className="mt-2 text-lg font-black italic">${displayedPrice.toLocaleString("es-CO")}</p>
                {model3dUrl && <p className="mt-3 rounded-full bg-black px-3 py-2 text-center text-[9px] font-black uppercase tracking-widest text-white">Modelo 3D preparado</p>}
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30"><ImageIcon size={64} className="mx-auto mb-4"/><p className="text-sm font-black uppercase italic">La vista del producto aparecerá aquí</p></div>
          )}
        </div>
      </div>

      {message && <p role="status" className={message.startsWith("Producto creado") ? "font-semibold text-green-600" : "font-semibold text-red-600"}>{message}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-black py-5 text-white">{loading ? "Guardando..." : "Crear producto"}</Button>
    </form>
  );
};
