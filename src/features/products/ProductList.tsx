"use client";

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { X, Rotate3d } from 'lucide-react';
import { Product3DViewer } from '@/components/products/Product3DViewer';

interface ProductListProps {
  products: Product[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const addItem = useCartStore(state => state.addItem);
  const [active3DProductId, setActive3DProductId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {products.map(product => {
          const productPath = `/products/${product.id}`;
          const variants = product.variants ?? [];

          return (
            <div key={product.id} className="group bg-[#f1eee7] border-2 border-[#d8d2c7] rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl hover:border-orange-300 transition-all duration-500 relative overflow-hidden flex flex-col h-full">
              {product.salesCount > 10 && (
                <div className="absolute top-4 right-[-35px] bg-black text-white text-[8px] font-black py-1 px-10 transform rotate-45 z-10 uppercase tracking-widest italic shadow-lg">
                  Los Más Pedidos
                </div>
              )}

              <div
                className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#e5e0d7] mb-6 cursor-grab active:cursor-grabbing"
                onClick={() => setActive3DProductId(active3DProductId === product.id ? null : product.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActive3DProductId(active3DProductId === product.id ? null : product.id);
                  }
                }}
                aria-label={`Abrir modelo 3D de ${product.name}`}
              >
                {active3DProductId === product.id ? (
                  <>
                    <Product3DViewer
                      modelUrl={product.model3dUrl}
                      posterUrl={product.imageUrl}
                      productName={product.name}
                      className="!h-full !min-h-0 rounded-[2rem]"
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActive3DProductId(null);
                      }}
                      className="absolute right-3 top-3 z-30 rounded-full bg-black/85 p-2 text-white shadow-xl hover:bg-orange-600"
                      aria-label="Cerrar modelo 3D"
                      title="Cerrar modelo 3D"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <img
                      src={product.imageUrl || "/placeholder-shoe.svg"}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/placeholder-shoe.svg";
                      }}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 drop-shadow-xl p-4"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 hover:bg-black/10 hover:opacity-100">
                      <div className="bg-[#f8f6f1] text-black px-5 py-3 rounded-full font-black uppercase italic text-[10px] shadow-2xl border-2 border-black flex items-center gap-2">
                        <Rotate3d size={15} /> Tocar para girar en 3D
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link href={productPath} className="block flex-1">
                <div className="px-2">
                  <h3 className="font-black uppercase italic text-lg leading-tight hover:text-orange-600 transition-colors mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-[10px] font-bold uppercase mb-4 tracking-widest">
                    {product.category || 'Calzado Nacional'}
                  </p>

                  <div className="flex items-center gap-2 mb-6">
                    {product.discountPrice ? (
                      <>
                        <span className="text-2xl font-black text-orange-600 italic">
                          ${Number(product.discountPrice).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 line-through font-bold">
                          ${Number(product.basePrice).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-black italic">
                        ${Number(product.basePrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setActive3DProductId(active3DProductId === product.id ? null : product.id);
                }}
                className="absolute bottom-[110px] right-8 bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:bg-black transition-all z-20"
                title="Ver modelo 3D"
                aria-label={`Ver ${product.name} en 3D`}
                type="button"
              >
                <Rotate3d size={20} />
              </button>

              <div className="space-y-3 mt-4 pt-4 border-t border-[#d3cdc2]">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    Tallas Nacionales
                  </p>
                  <span className="text-[8px] font-black text-orange-600 uppercase italic">
                    Horma Real
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.slice(0, 3).map(variant => (
                    <button
                      key={variant.id}
                      disabled={variant.stock <= 0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem({
                          variantId: variant.id,
                          name: product.name,
                          price: Number(product.discountPrice || product.basePrice),
                          quantity: 1,
                          size: variant.size,
                          color: variant.color,
                          image: product.imageUrl
                        });
                      }}
                      className="bg-[#e7e2d9] hover:bg-black hover:text-white transition-all px-3 py-2 rounded-xl text-[10px] font-black italic border border-[#d3cdc2] flex-1 min-w-[50px] flex flex-col items-center leading-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#e7e2d9] disabled:hover:text-black"
                      type="button"
                    >
                      <span>{variant.stock > 0 ? variant.size : 'Agotado'}</span>
                      <span className="text-[6px] opacity-40 mt-1">NAC</span>
                    </button>
                  ))}
                  {variants.length > 3 && (
                    <Link
                      href={productPath}
                      className="text-[9px] font-black text-orange-600 flex items-center italic hover:underline ml-auto"
                    >
                      +{variants.length - 3} más
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </>
  );
};
