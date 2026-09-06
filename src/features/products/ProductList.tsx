"use client";

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { X, Rotate3d, ShoppingBag, Eye } from 'lucide-react';
import { Product3DViewer } from '@/components/products/Product3DViewer';

interface ProductListProps {
  products: Product[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const addItem = useCartStore(state => state.addItem);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {products.map(product => {
          const productPath = `/products/${product.id}`;

          return (
            <div key={product.id} className="group bg-white border-2 border-gray-100 rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col h-full">
              {/* Etiqueta de Popularidad */}
              {product.salesCount > 10 && (
                <div className="absolute top-4 right-[-35px] bg-black text-white text-[8px] font-black py-1 px-10 transform rotate-45 z-10 uppercase tracking-widest italic shadow-lg">
                  Los Más Pedidos
                </div>
              )}

              {/* ENLACE GIGANTE (Toda la parte superior es clickeable) */}
              <Link href={productPath} className="block group/link flex-1">
                <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-gray-50 mb-6">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 drop-shadow-xl p-4"
                    />
                  )}

                  {/* Overlay visual al pasar el mouse */}
                  <div className="absolute inset-0 bg-black/0 group-hover/link:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover/link:opacity-100">
                    <div className="bg-white text-black px-6 py-3 rounded-full font-black uppercase italic text-[10px] shadow-2xl border-2 border-black flex items-center gap-2 transform -rotate-2">
                      <Eye size={14} /> Ver en Detalle
                    </div>
                  </div>
                </div>

                <div className="px-2">
                  <h3 className="font-black uppercase italic text-lg leading-tight group-hover/link:text-orange-600 transition-colors mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-4 tracking-widest">{product.category || 'Calzado Nacional'}</p>

                  <div className="flex items-center gap-2 mb-6">
                    {product.discountPrice ? (
                      <>
                        <span className="text-2xl font-black text-red-600 italic">${Number(product.discountPrice).toLocaleString()}</span>
                        <span className="text-sm text-gray-400 line-through font-bold">${Number(product.basePrice).toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-black italic">${Number(product.basePrice).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Botón 3D Rápido (Fuera del link para no interferir) */}
              {product.model3dUrl && (
                <button
                  onClick={() => setQuickViewProduct(product)}
                  className="absolute bottom-[110px] right-8 bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:bg-black transition-all z-20 animate-bounce"
                  title="Ver en 3D"
                >
                  <Rotate3d size={20} />
                </button>
              )}

              {/* Selector Rápido de Talla (Parte Inferior) */}
              <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tallas Nacionales 🇨🇴</p>
                  <span className="text-[8px] font-black text-orange-600 uppercase italic">Horma Real</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants?.slice(0, 3).map(variant => (
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
                      className="bg-gray-50 hover:bg-black hover:text-white transition-all px-3 py-2 rounded-xl text-[10px] font-black italic border border-gray-100 flex-1 min-w-[50px] flex flex-col items-center leading-none"
                    >
                      <span>{variant.stock > 0 ? variant.size : '❌'}</span>
                      <span className="text-[6px] opacity-40 mt-1">NAC</span>
                    </button>
                  ))}
                  {product.variants?.length > 3 && (
                    <Link href={productPath} className="text-[9px] font-black text-orange-600 flex items-center italic hover:underline ml-auto">
                      +{product.variants.length - 3} más
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE VISTA RÁPIDA 3D */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-orange-500">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-6 right-6 z-50 bg-black text-white p-3 rounded-full hover:bg-orange-600 transition-all shadow-xl"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-[400px] md:h-[600px] bg-gray-50 border-r border-gray-100">
                <Product3DViewer
                  modelUrl={quickViewProduct.model3dUrl}
                  posterUrl={quickViewProduct.imageUrl}
                />
              </div>
              <div className="p-10 flex flex-col justify-center bg-white">
                <span className="bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic mb-4 inline-block w-fit">
                  🇨🇴 Fábrica Nacional
                </span>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 leading-none mb-4">
                  {quickViewProduct.name}
                </h2>
                <p className="text-gray-500 font-medium italic mb-8 leading-tight">
                  Interactúa con el modelo 3D a la izquierda. Gíralo y convéncete de la calidad de nuestros pegues.
                </p>
                <Link href={`/products/${quickViewProduct.id}`} className="w-full">
                  <Button className="w-full py-6 bg-black text-white font-black uppercase italic text-xs rounded-2xl flex items-center justify-center gap-3">
                    <ShoppingBag size={18} /> Ver tallas y Comprar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
