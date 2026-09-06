"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/useCartStore';
import { Product3DViewer } from '@/components/products/Product3DViewer';
import { ShoppingBag, ChevronLeft, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';

interface Props {
  product: any;
}

export const ProductDetailView: React.FC<Props> = ({ product }) => {
  const { addItem } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  // Iniciamos en vista 3D por defecto si el modelo existe para dar prioridad al producto
  const [view3d, setView3d] = useState(!!product.model3dUrl);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleWhatsApp = () => {
    const storePhone = selectedVariant?.store?.phone || "573000000000";
    const message = encodeURIComponent(
      `Hola! 👋 Estoy interesado en los *${product.name}* en talla *${selectedVariant?.size}*. ¿Tienen disponibilidad inmediata?`
    );
    window.open(`https://wa.me/${storePhone}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-xs font-black uppercase italic text-gray-400 hover:text-black mb-8 transition-colors">
        <ChevronLeft size={16} /> Volver a la Vitrina
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16">
        {/* Lado Izquierdo: FOCO TOTAL EN EL MODELO */}
        <div className="relative">
          <div className="w-full rounded-[3rem] overflow-hidden bg-white shadow-sm border border-gray-100 transition-all duration-500">
            {view3d && product.model3dUrl ? (
              <Product3DViewer modelUrl={product.model3dUrl} posterUrl={product.imageUrl} />
            ) : (
              <div className="h-[600px] lg:h-[700px] flex items-center justify-center p-12">
                <img
                  src={product.imageUrl || '/placeholder-shoe.png'}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl"
                />
              </div>
            )}

            {product.model3dUrl && (
              <button
                onClick={() => setView3d(!view3d)}
                className="absolute bottom-8 right-8 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest shadow-2xl hover:bg-orange-600 transition-all z-20"
              >
                {view3d ? '📸 Ver Foto Real' : '🕹️ Activar Visor 3D'}
              </button>
            )}
          </div>
        </div>

        {/* Lado Derecho: Información Esencial y Compra */}
        <div className="flex flex-col">
          <div className="mb-12">
            <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase italic mb-4 inline-block">
              🇨🇴 Fábrica Nacional
            </span>
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-gray-900 leading-none mb-4">
              {product.name}
            </h1>
            <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-6">
              {product.gender} • {product.category} • {product.usage}
            </p>
            <p className="text-gray-500 font-medium italic leading-relaxed text-xl">
              {product.description || "Diseñados por manos colombianas para aguantar el trote del día a día."}
            </p>
          </div>

          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tallas Disponibles (Horma Nacional)</p>
              <button 
                onClick={() => setShowSizeGuide(true)}
                className="text-[9px] font-black text-orange-600 uppercase underline decoration-black hover:text-black transition-colors"
              >
                Guía de Hormas 📏
              </button>
            </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`w-16 h-16 rounded-2xl text-sm font-black transition-all border-2 flex flex-col items-center justify-center leading-none ${
                    selectedVariant?.id === v.id
                      ? 'border-black bg-black text-white shadow-lg scale-110'
                      : 'border-gray-100 text-gray-400 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-lg">{v.size}</span>
                  <span className="text-[7px] mt-1 opacity-60 uppercase">Nac</span>
                </button>
              ))}
            </div>
            {selectedVariant && (
              <div className="mt-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 inline-flex items-center gap-3">
                <span className="text-lg">🔥</span>
                <p className="text-[11px] font-bold text-gray-600 uppercase leading-tight">
                  Color <span className="text-black">{selectedVariant.color}</span> | <span className="text-black">{selectedVariant.stock} pares disponibles.</span>
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-12 border-t border-gray-100">
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Precio Directo de Fábrica</p>
                <p className="text-5xl font-black italic text-gray-900">${Number(product.basePrice).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-green-600 uppercase bg-green-50 px-3 py-1 rounded-full border border-green-100">
                  15% más económico que importados
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                className="w-full py-10 bg-black text-white font-black italic uppercase text-xl rounded-[2.5rem] shadow-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-4"
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
                <ShoppingBag size={28} />
                {selectedVariant?.stock > 0 ? 'Añadir al Carrito' : 'Agotado en esta talla'}
              </Button>

              <Button
                className="w-full py-6 bg-white text-black border-2 border-black font-black italic uppercase text-sm rounded-[2.5rem] hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                onClick={handleWhatsApp}
              >
                <MessageCircle size={20} className="text-green-600" />
                Consultar Disponibilidad por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL GUÍA DE HORMAS */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-black uppercase italic mb-2">Guía de Tallas 🇨🇴</h2>
            <p className="text-gray-500 text-xs font-bold mb-6 uppercase tracking-widest">Mide tu pie en cm para asegurar el ajuste perfecto</p>
            
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase italic">
                  <tr>
                    <th className="px-4 py-3">Centímetros</th>
                    <th className="px-4 py-3">Talla Nac.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {[
                    { cm: '25.0 - 25.5', talla: '38' },
                    { cm: '25.6 - 26.0', talla: '39' },
                    { cm: '26.1 - 26.5', talla: '40' },
                    { cm: '26.6 - 27.0', talla: '41' },
                    { cm: '27.1 - 27.5', talla: '42' },
                    { cm: '27.6 - 28.0', talla: '43' },
                    { cm: '28.1 - 28.5', talla: '44' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-orange-50 transition-colors">
                      <td className="px-4 py-3 font-bold">{row.cm} cm</td>
                      <td className="px-4 py-3 font-black text-black">{row.talla}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-[10px] font-bold text-orange-800 leading-tight text-center italic">
                💡 Tip: Mide tu pie al final del día, cuando esté más expandido.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
