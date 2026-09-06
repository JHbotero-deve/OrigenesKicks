"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Camera, Image as ImageIcon, Sparkles, MapPin } from 'lucide-react';

export const ProductEditorPro = () => {
  const [previewUrl, setPreviewUrl] = useState('');
  const [productName, setProductName] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-gray-100">
      {/* Lado Izquierdo: Formulario */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Nuevo Lanzamiento</h2>
          <p className="text-gray-500 text-sm">Sube tus Kicks y nosotros nos encargamos de que se vean de lujo.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Nombre del Modelo</label>
            <input
              type="text"
              placeholder="Ej: Jordan Retro 4 'Barrio Edition'"
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-bold"
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

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
              <p className="font-black uppercase text-xs">Toca para subir la foto</p>
              <p className="text-[10px] text-gray-400 uppercase mt-1">Preferiblemente fondo blanco o neutro</p>
            </div>
          </div>
        </div>

        <Button className="w-full py-6 bg-black text-white font-black uppercase italic rounded-2xl shadow-xl hover:bg-orange-600 transition-all">
          Publicar en la Vitrina Nacional
        </Button>
      </div>

      {/* Lado Derecho: La "Magia" (Vista Previa Estética) */}
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-[2rem] p-8 border-2 border-dashed border-gray-200 relative overflow-hidden">
        <div className="absolute top-4 left-4 flex items-center gap-1">
          <Sparkles size={14} className="text-orange-500" />
          <span className="text-[9px] font-black uppercase text-orange-600 tracking-widest italic">Simulación de Vitrina</span>
        </div>

        {previewUrl ? (
          <div className="w-full max-w-sm">
             {/* Marco Estético */}
             <div className="bg-white rounded-[2rem] p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transform rotate-2 hover:rotate-0 transition-transform duration-500 relative group">
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic border-2 border-black z-10 shadow-lg">
                  100% Colombiano 🇨🇴
                </div>

                <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white flex items-center justify-center mb-6">
                  <img src={previewUrl} className="w-full h-full object-contain mix-blend-multiply drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)]" alt="Preview" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-black uppercase italic text-xl leading-none">{productName || 'Nombre del Kick'}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-orange-600">Fábrica del Barrio</span>
                    <span className="text-lg font-black italic">$349.900</span>
                  </div>
                </div>
             </div>
             <p className="text-[10px] text-center text-gray-400 mt-8 font-medium uppercase tracking-widest">
               "Así es como lo verán tus clientes: Profesional, limpio y con el sello nacional."
             </p>
          </div>
        ) : (
          <div className="text-center space-y-4 opacity-30">
            <ImageIcon size={64} className="mx-auto" />
            <p className="font-black uppercase italic text-sm tracking-tighter leading-none">Tu zapato aparecerá aquí<br/>con diseño de revista</p>
          </div>
        )}
      </div>
    </div>
  );
};
