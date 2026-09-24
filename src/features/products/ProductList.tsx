"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { useCartStore } from "@/stores/useCartStore";
import Link from "next/link";
import { X, Rotate3d, ShoppingBag } from "lucide-react";
import { Product3DViewer } from "@/components/products/Product3DViewer";
import { Button } from "@/components/ui/Button";

interface ProductListProps { products: Product[]; }

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [active3DProductId, setActive3DProductId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const productPath = "/products/" + product.id;
        const variants = product.variants ?? [];
        const availableVariants = variants.filter((variant) => variant.stock > 0);
        const selected = availableVariants[0] ?? variants[0] ?? null;
        const price = Number(product.discountPrice ?? product.basePrice);
        const basePrice = Number(product.basePrice);
        const hasDiscount = Number.isFinite(price) && Number.isFinite(basePrice) && price < basePrice;
        const has3D = Boolean(product.model3dUrl);

        return (
          <article key={product.id} className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[2.2rem] border-2 border-[#d8d2c7] bg-[#f1eee7] p-3 shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-2xl sm:p-4">
            {product.salesCount > 10 && (
              <div className="absolute right-[-38px] top-5 z-10 rotate-45 bg-black px-10 py-1 text-[8px] font-black uppercase italic tracking-widest text-white shadow-lg">
                Los más pedidos
              </div>
            )}

            <div className="relative mb-5 aspect-square overflow-hidden rounded-[1.8rem] bg-[#e5e0d7]">
              {active3DProductId === product.id && has3D ? (
                <>
                  <Product3DViewer modelUrl={product.model3dUrl} posterUrl={product.imageUrl} productName={product.name} className="!h-full !min-h-0 rounded-[1.8rem]" />
                  <button type="button" onClick={() => setActive3DProductId(null)} className="absolute right-3 top-3 z-20 rounded-full bg-black/85 p-2 text-white shadow-xl" aria-label="Cerrar modelo 3D">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <img src={product.imageUrl || "/placeholder-shoe.svg"} alt={product.name}
                    className="h-full w-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/placeholder-shoe.svg"; }}
                  />
                  {has3D && (
                    <button type="button" onClick={() => setActive3DProductId(product.id)}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-[9px] font-black uppercase italic tracking-wider text-white shadow-xl hover:bg-orange-600"
                      aria-label={"Ver " + product.name + " en 3D"}>
                      <Rotate3d size={14} /> 3D
                    </button>
                  )}
                </>
              )}
            </div>

            <Link href={productPath} className="block min-w-0 flex-1 px-2">
              <h3 className="break-words text-lg font-black uppercase italic leading-tight tracking-tight text-gray-900 hover:text-orange-600">{product.name}</h3>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">{product.category || "Calzado nacional"}</p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <span className="text-2xl font-black italic text-gray-950">{"$"}{price.toLocaleString("es-CO")}</span>
                {hasDiscount && <span className="text-xs font-bold text-gray-400 line-through">{"$"}{basePrice.toLocaleString("es-CO")}</span>}
              </div>
            </Link>

            <div className="mt-5 border-t border-[#d3cdc2] px-2 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Tallas disponibles</p>
                <span className="text-[8px] font-black uppercase text-orange-600">{has3D ? "3D disponible" : "Foto"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {variants.slice(0, 5).map((variant) => (
                  <button key={variant.id} type="button" disabled={variant.stock <= 0}
                    onClick={() => {
                      if (variant.stock <= 0) return;
                      addItem({ variantId: variant.id, name: product.name, price, quantity: 1, size: variant.size, color: variant.color, image: product.imageUrl });
                    }}
                    className="min-w-[48px] flex-1 rounded-xl border border-[#d3cdc2] bg-[#e7e2d9] px-2 py-2 text-[10px] font-black italic transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                    {variant.stock > 0 ? variant.size : "Agotado"}
                  </button>
                ))}
                {variants.length > 5 && <Link href={productPath} className="flex items-center px-1 text-[9px] font-black text-orange-600">+{variants.length - 5}</Link>}
              </div>
              <Button type="button" disabled={!selected || selected.stock <= 0}
                onClick={() => selected && selected.stock > 0 && addItem({ variantId: selected.id, name: product.name, price, quantity: 1, size: selected.size, color: selected.color, image: product.imageUrl })}
                className="mt-3 w-full rounded-2xl bg-black py-3 text-[10px] font-black uppercase italic text-white hover:bg-orange-600">
                <ShoppingBag size={15} className="mr-2" /> Añadir talla {selected?.size ?? ""}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
};
