"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/useCartStore';
import { Product3DViewer } from '@/components/products/Product3DViewer';
import { ShoppingBag, ChevronLeft, ShieldCheck, Truck, Zap } from 'lucide-react';
import Link from 'next/link';

interface Props {
  product: any;
}

export const ProductDetailView: React.FC<Props> = ({ product }) => {
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [view3d, setView3d] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-xs font-black uppercase italic text-gray-400 hover:text-black mb-8 transition-colors">
        <ChevronLeft size={16} /> Volver a la Vitrina
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Lado Izquierdo: Visualización */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
            {view3d && product.model3dUrl ? (
              <Product3DViewer modelUrl={product.model3dUrl} posterUrl={product.imageUrl} />
            ) : (
              <img
                src={product.imageUrl || '/placeholder-shoe.png'}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl"
              />
            )}

            {product.model3dUrl && (
              <button
                onClick={() => setView3d(!view3d)}
                className="absolute bottom-6 right-6 bg-black text-white px-6 py-3 rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-xl hover:bg-orange-600 transition-all z-20"
              >
                {view3d ? 'Ver Foto Real' : '🕹️ Activar Visor 3D'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
              <Zap size={20} className="mx-auto text-orange-600 mb-2" />
              <p className="text-[9px] font-black uppercase text-orange-800 leading-tight">Alto Desempeño</p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
              <ShieldCheck size={20} className="mx-auto text-green-600 mb-2" />
              <p className="text-[9px] font-black uppercase text-green-800 leading-tight">Calidad Garantizada</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
              <Truck size={20} className="mx-auto text-blue-600 mb-2" />
              <p className="text-[9px] font-black uppercase text-blue-800 leading-tight">Envío de Confianza</p>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Información y Compra */}
        <div className="flex flex-col">
          <div className="mb-8">
            <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase italic mb-4 inline-block">
              🇨🇴 Fábrica Nacional
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 leading-none mb-4">
              {product.name}
            </h1>
            <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-6">
              {product.gender} • {product.category} • {product.usage}
            </p>
            <p className="text-gray-500 font-medium italic leading-relaxed text-lg">
              {product.description || "Diseñados por manos colombianas para aguantar el trote del día a día. Estilo único del barrio para el mundo."}
            </p>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-end mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecciona tu Talla Nacional 🇨🇴</p>
              <button className="text-[9px] font-black text-orange-600 uppercase underline decoration-black">Guía de Hormas</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`w-14 h-14 rounded-2xl text-sm font-black transition-all border-2 flex flex-col items-center justify-center leading-none ${
                    selectedVariant?.id === v.id
                      ? 'border-black bg-black text-white shadow-lg'
                      : 'border-gray-100 text-gray-400 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span>{v.size}</span>
                  <span className="text-[7px] mt-1 opacity-60 uppercase">Nac</span>
                </button>
              ))}
            </div>
            {selectedVariant && (
              <p className="mt-4 text-[9px] font-bold text-gray-400 uppercase bg-gray-50 p-3 rounded-xl border border-gray-100 inline-block leading-tight">
                🔥 <span className="text-black">Horma Colombiana Real:</span> Color {selectedVariant.color} | Quedan {selectedVariant.stock} pares en bodega.
              </p>
            )}
          </div>

          <div className="mt-auto pt-8 border-t border-gray-100">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Precio Directo de Fábrica</p>
                <p className="text-4xl font-black italic text-gray-900">${Number(product.basePrice).toLocaleString()}</p>
              </div>
              <p className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-3 py-1 rounded-full border border-green-100">
                Ahorras un 15% vs importados
              </p>
            </div>

            <Button
              className="w-full py-8 bg-black text-white font-black italic uppercase text-lg rounded-[2rem] shadow-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-4"
              onClick={() => addItem({
                variantId: selectedVariant.id,
                name: product.name,
                price: Number(product.basePrice),
                quantity: 1,
                size: selectedVariant.size,
                color: selectedVariant.color,
                image: product.imageUrl
              })}
              disabled={!selectedVariant || selectedVariant.stock <= 0}
            >
              <ShoppingBag size={24} />
              {selectedVariant?.stock > 0 ? 'Añadir a mi Carrito' : 'Agotado en esta talla'}
            </Button>

            <p className="text-[10px] text-center text-gray-400 mt-6 font-bold uppercase tracking-tighter">
              Pago 100% Seguro • Cambios por daños de fábrica • Industria Colombiana
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
