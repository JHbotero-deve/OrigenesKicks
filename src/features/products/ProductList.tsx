"use client";

import React from 'react';
import { Product } from '@/types/product';
import { useCartStore } from '@/stores/useCartStore';
import { Button } from '@/components/ui/Button';

interface ProductListProps {
  products: Product[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const addItem = useCartStore(state => state.addItem);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map(product => (
        <div key={product.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          {product.salesCount > 10 && (
            <div className="absolute top-2 right-[-35px] bg-black text-white text-[8px] font-black py-1 px-10 transform rotate-45 z-10 uppercase tracking-widest">
              Top Ventas
            </div>
          )}
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4" />
          )}
          <h3 className="font-bold text-lg">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.description}</p>

          <div className="flex items-center gap-2 mb-4">
            {product.discountPrice ? (
              <>
                <span className="text-xl font-black text-red-600">${Number(product.discountPrice).toLocaleString()}</span>
                <span className="text-sm text-gray-400 line-through">${Number(product.basePrice).toLocaleString()}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-black">${Number(product.basePrice).toLocaleString()}</span>
            )}
          </div>

          <div className="space-y-2">
            {product.variants?.map(variant => (
              <div key={variant.id} className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">Talla: {variant.size}</span>
                  {variant.stock > 0 && variant.stock <= 2 ? (
                    <span className="text-[9px] font-black bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter animate-bounce mt-0.5 w-fit">
                      ¡Casi agotado! Quedan {variant.stock}
                    </span>
                  ) : variant.stock > 0 ? (
                    <span className="text-[10px] text-gray-400 italic">Disponibilidad inmediata</span>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  disabled={variant.stock <= 0}
                  onClick={() => addItem({
                    variantId: variant.id,
                    productId: product.id,
                    name: product.name,
                    size: variant.size,
                    color: variant.color,
                    price: Number(product.discountPrice || product.basePrice),
                    quantity: 1,
                    image: product.imageUrl
                  })}
                >
                  {variant.stock > 0 ? 'Añadir' : 'Agotado'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
