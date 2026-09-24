"use client";

import React, { useState } from "react";
import { Camera, Sparkles, ImageIcon, Plus, Trash2 } from "lucide-react";

import { createProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";

const sizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];

type VariantDraft = {
  size: string;
  color: string;
  stock: string;
};

export const ProductEditorPro = () => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [sku, setSku] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([
    { size: "40", color: "", stock: "0" },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const updateVariant = (
    index: number,
    field: keyof VariantDraft,
    value: string
  ) => {
    setVariants((current) =>
      current.map((variant, position) =>
        position === index
          ? { ...variant, [field]: value }
          : variant
      )
    );
  };

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      { size: "40", color: "", stock: "0" },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) return;

    setVariants((current) =>
      current.filter((_, position) => position !== index)
    );
  };

  const resetForm = () => {
    setProductName("");
    setDescription("");
    setBasePrice("");
    setDiscountPrice("");
    setSku("");
    setImageUrl("");
    setPreviewUrl("");
    setVariants([{ size: "40", color: "", stock: "0" }]);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (!productName.trim()) {
        setMessage("Debes ingresar el nombre del producto.");
        return;
      }

      if (!basePrice || Number(basePrice) <= 0) {
        setMessage("Debes ingresar un precio base válido.");
        return;
      }

      if (discountPrice && Number(discountPrice) <= 0) {
        setMessage("El precio de descuento debe ser válido.");
        return;
      }

      if (
        discountPrice &&
        Number(discountPrice) >= Number(basePrice)
      ) {
        setMessage(
          "El precio de descuento debe ser menor al precio base."
        );
        return;
      }

      const validVariants = variants.filter(
        (variant) =>
          variant.size.trim() &&
          variant.color.trim() &&
          Number(variant.stock) >= 0
      );

      if (validVariants.length === 0) {
        setMessage(
          "Debes agregar al menos una variante con talla y color."
        );
        return;
      }

      if (imageUrl && !/^https?:\/\/.+/i.test(imageUrl.trim())) {
        setMessage("La URL de imagen no es válida.");
        return;
      }

      const result = await createProduct({
        name: productName.trim(),
        description: description.trim(),
        basePrice: Number(basePrice),
        discountPrice: discountPrice
          ? Number(discountPrice)
          : null,
        imageUrl: imageUrl.trim(),
        sku: sku.trim(),
        variants: validVariants.map((variant) => ({
          size: variant.size.trim(),
          color: variant.color.trim(),
          stock: Number(variant.stock),
        })),
      });

      if (result.success) {
        setMessage("Producto creado correctamente.");
        resetForm();
      } else {
        setMessage(
          result.error || "No se pudo crear el producto."
        );
      }
    } catch (error) {
      console.error("Error al crear producto:", error);
      setMessage("No se pudo crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  const displayedPrice =
    discountPrice && Number(discountPrice) > 0
      ? Number(discountPrice)
      : Number(basePrice) > 0
        ? Number(basePrice)
        : 349900;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100">
        {/* Lado izquierdo */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">
              Nuevo Lanzamiento
            </h2>

            <p className="text-gray-500 text-sm">
              Crea el producto y sus variantes directamente en la
              base de datos.
            </p>
          </div>

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                Nombre del Modelo
              </label>

              <input
                type="text"
                value={productName}
                placeholder="Ej: Jordan Retro 4 Barrio Edition"
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold"
                onChange={(e) =>
                  setProductName(e.target.value)
                }
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                Descripción
              </label>

              <textarea
                value={description}
                placeholder="Describe el producto..."
                rows={3}
                maxLength={1000}
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all text-sm resize-none"
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                  Precio Base
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={basePrice}
                  placeholder="349900"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold"
                  onChange={(e) =>
                    setBasePrice(e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                  Precio Descuento
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={discountPrice}
                  placeholder="Opcional"
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold"
                  onChange={(e) =>
                    setDiscountPrice(e.target.value)
                  }
                />
              </div>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                SKU Base
              </label>

              <input
                type="text"
                value={sku}
                placeholder="Ej: OK-JR4-BARRIO"
                maxLength={80}
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold uppercase"
                onChange={(e) => setSku(e.target.value)}
              />

              <p className="text-[9px] text-gray-400 mt-1">
                Los SKU de las variantes se generan automáticamente.
              </p>
            </div>

            {/* URL imagen */}
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                URL de Imagen
              </label>

              <input
                type="url"
                value={imageUrl}
                placeholder="https://..."
                maxLength={1000}
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all text-sm"
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
              />

              <p className="text-[9px] text-gray-400 mt-1">
                La imagen debe estar alojada en una URL pública.
              </p>
            </div>

            {/* Carga / preview local */}
            <div className="relative border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center hover:border-orange-500 transition-colors group cursor-pointer">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
                accept="image/*"
              />

              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera size={24} />
                </div>

                <p className="font-black uppercase text-xs">
                  Toca para subir la foto
                </p>

                <p className="text-[10px] text-gray-400 uppercase mt-1">
                  Solo vista previa por ahora
                </p>
              </div>
            </div>

            {/* Variantes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black uppercase text-gray-400">
                  Variantes
                </label>

                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1 text-[10px] font-black uppercase text-orange-600 hover:text-orange-700"
                >
                  <Plus size={14} />
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div
                    key={`${index}-${variant.size}`}
                    className="rounded-2xl bg-gray-50 p-3 border border-gray-100"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr_0.8fr_auto] gap-2 items-end">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                          Talla
                        </label>

                        <select
                          value={variant.size}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "size",
                              e.target.value
                            )
                          }
                          className="w-full p-3 bg-white rounded-xl border border-gray-200 outline-none font-bold"
                        >
                          {sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                          Color
                        </label>

                        <input
                          type="text"
                          value={variant.color}
                          placeholder="Negro"
                          maxLength={60}
                          className="w-full p-3 bg-white rounded-xl border border-gray-200 outline-none font-bold"
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "color",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase text-gray-400 mb-1">
                          Stock
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100000"
                          value={variant.stock}
                          className="w-full p-3 bg-white rounded-xl border border-gray-200 outline-none font-bold"
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "stock",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={variants.length === 1}
                        className="p-3 rounded-xl text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Eliminar variante"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-[2rem] p-8 border-2 border-dashed border-gray-200 relative overflow-hidden min-h-[500px]">
          <div className="absolute top-4 left-4 flex items-center gap-1">
            <Sparkles size={14} className="text-orange-500" />

            <span className="text-[9px] font-black uppercase text-orange-600 tracking-widest italic">
              Simulación de Vitrina
            </span>
          </div>

          {previewUrl ? (
            <div className="w-full max-w-sm">
              <div className="bg-white rounded-[2rem] p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transform rotate-2 hover:rotate-0 transition-transform duration-500 relative group">
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic border-2 border-black z-10 shadow-lg">
                  100% Colombiano
                </div>

                <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white flex items-center justify-center mb-6">
                  <img
                    src={previewUrl}
                    alt="Vista previa del producto"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setPreviewUrl("");
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-black uppercase italic text-xl leading-none">
                    {productName || "Nombre del Kick"}
                  </h3>

                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                      Fábrica del Barrio
                    </span>

                    <span className="text-lg font-black italic">
                      $
                      {displayedPrice.toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-center text-gray-400 mt-8 font-medium uppercase tracking-widest">
                "Así es como lo verán tus clientes: Profesional,
                limpio y con el sello nacional."
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-30">
              <ImageIcon size={64} className="mx-auto" />

              <p className="font-black uppercase italic text-sm tracking-tighter leading-none">
                Tu zapato aparecerá aquí
                <br />
                con diseño de revista
              </p>
            </div>
          )}
        </div>
      </div>

      {message && (
        <p
          className={
            message.startsWith("Producto creado")
              ? "text-green-600 font-semibold"
              : "text-red-600 font-semibold"
          }
        >
          {message}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-black py-5 text-white"
      >
        {loading ? "Guardando..." : "Crear producto"}
      </Button>
    </form>
  );
};
