"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/useCartStore';
import { Zap, ShoppingBag, ShieldCheck } from 'lucide-react';

interface Props {
  product: any;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = React.useState(product.variants[0]);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      {/* Etiqueta de Origen */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-tighter shadow-sm">
          🇨🇴 Fábrica Nacional
        </span>
        <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase italic tracking-tighter">
          {product.usage}
        </span>
      </div>

      {/* Imagen Principal */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl || '/placeholder-shoe.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <p className="text-white text-xs font-bold leading-tight italic">
            "Hechos en el barrio, para conquistar la ciudad. Calidad que se siente en cada paso."
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-gray-800 leading-none">
              {product.name}
            </h3>
            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">
              {product.gender} • {product.category}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black italic text-gray-900">${Number(product.basePrice).toLocaleString()}</p>
            {product.discountPrice && (
              <p className="text-[10px] text-gray-400 line-through font-bold">${Number(product.discountPrice).toLocaleString()}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-4 font-medium italic">
          {product.description || "Diseñados para tu día a día y tus rutinas de deporte. Economía y durabilidad garantizada."}
        </p>

        {/* Selector de Tallas */}
        <div className="mb-6">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Selecciona tu Talla</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: any) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all border-2 ${
                  selectedVariant?.id === v.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-100 text-gray-400 hover:border-gray-300'
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>

        {/* Beneficios de Marca */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase">
            <Zap size={12} className="text-yellow-500" /> Rendimiento Diario
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase">
            <ShieldCheck size={12} className="text-green-500" /> Entrega 100% Segura
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-auto flex gap-2">
          <Button
            className="flex-1 bg-black text-white font-black italic uppercase text-xs py-4 rounded-2xl group-hover:bg-orange-600 transition-colors"
            onClick={() => addItem({
              variantId: selectedVariant.id,
              name: product.name,
              price: Number(product.basePrice),
              quantity: 1,
              size: selectedVariant.size,
              color: selectedVariant.color,
              image: product.imageUrl
            })}
          >
            <ShoppingBag size={16} className="mr-2" /> Añadir al Carrito
          </Button>

          {product.model3dUrl && (
            <Button variant="outline" className="rounded-2xl border-2 py-4" title="Ver en 3D">
              🕹️
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
