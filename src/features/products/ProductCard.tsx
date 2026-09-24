"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/useCartStore";
import { Zap, ShoppingBag, ShieldCheck } from "lucide-react";

interface ProductVariant { id: string; size: string; color: string; stock: number; }
interface ProductCardData {
  id: string; name: string; description?: string | null;
  basePrice: number | string; discountPrice?: number | string | null;
  imageUrl?: string | null; model3dUrl?: string | null;
  usage?: string | null; gender?: string | null; category?: string | null;
  variants?: ProductVariant[];
}
interface Props { product: ProductCardData; }

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addItem } = useCartStore();
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const availableVariants = variants.filter((variant) => variant.stock > 0);
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant | null>(
    availableVariants[0] ?? variants[0] ?? null,
  );
  const salePrice = Number(product.discountPrice ?? product.basePrice);
  const basePrice = Number(product.basePrice);
  const hasDiscount = Number.isFinite(salePrice) && Number.isFinite(basePrice) && salePrice < basePrice;

  return (
    <div className="group bg-[#f1eee7] rounded-3xl overflow-hidden border border-[#d8d2c7] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-tighter shadow-sm">Fábrica Nacional</span>
        <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-tighter">{product.usage ?? "Diario"}</span>
      </div>
      <div className="relative aspect-square overflow-hidden bg-[#e5e0d7]">
        <img src={product.imageUrl || "/placeholder-shoe.svg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-800 leading-none">{product.name}</h3>
            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">{product.gender ?? "UNISEX"} • {product.category ?? "General"}</p>
          </div>
          <div className="text-right">
            {hasDiscount && <p className="text-[10px] text-gray-400 line-through font-bold">${basePrice.toLocaleString("es-CO")}</p>}
            <p className="text-xl font-black italic text-gray-900">${salePrice.toLocaleString("es-CO")}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 font-medium italic">{product.description || "Diseñados para tu día a día y tus rutinas de deporte."}</p>
        <div className="mb-6">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Selecciona tu Talla</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button type="button" key={variant.id} disabled={variant.stock <= 0} onClick={() => setSelectedVariant(variant)}
                className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all border-2 disabled:opacity-30 disabled:cursor-not-allowed ${selectedVariant?.id === variant.id ? "border-black bg-black text-white" : "border-[#d3cdc2] text-gray-500 hover:border-orange-300"}`}>
                {variant.size}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase"><Zap size={12} /> Rendimiento Diario</div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase"><ShieldCheck size={12} /> Entrega Segura</div>
        </div>
        <div className="mt-auto flex gap-2">
          <Button className="flex-1 bg-black text-white font-black italic uppercase text-xs py-4 rounded-2xl group-hover:bg-orange-600 transition-colors"
            disabled={!selectedVariant || selectedVariant.stock <= 0}
            onClick={() => {
              if (!selectedVariant || selectedVariant.stock <= 0) return;
              addItem({ variantId: selectedVariant.id, name: product.name, price: salePrice, quantity: 1, size: selectedVariant.size, color: selectedVariant.color, image: product.imageUrl ?? undefined });
            }}>
            <ShoppingBag size={16} className="mr-2" /> Añadir al Carrito
          </Button>
          {product.model3dUrl && <Button variant="outline" className="rounded-2xl border-2 py-4" title="Ver en 3D" aria-label="Ver producto en 3D">3D</Button>}
        </div>
      </div>
    </div>
  );
};
