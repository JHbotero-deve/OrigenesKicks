"use client";

import React from 'react';

export const PromoBanner: React.FC = () => {
  return (
    <div className="w-full bg-black text-white py-8 md:py-16 px-4 md:px-12 rounded-2xl mb-8 md:mb-12 overflow-hidden relative group">
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="bg-white text-black text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 uppercase tracking-[0.3em] mb-4">
          Nueva Colección 2026
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter mb-4 leading-none">
          Orígenes Kicks
        </h2>
        <p className="max-w-xs sm:max-w-md md:max-w-lg text-gray-400 text-[10px] sm:text-xs md:text-base mb-6 md:mb-8 uppercase tracking-widest leading-relaxed px-4">
          Estilo urbano sin límites. Reserva tus Kicks hoy y asegura tu lugar en la calle.
          <span className="text-white font-bold ml-1">#OriginalesComoTu</span>
        </p>

        <div className="flex gap-4">
          <div className="border border-white/30 px-6 py-2 text-xs uppercase font-bold tracking-widest">
            Edición Limitada
          </div>
        </div>
      </div>

      {/* Decoración Visual */}
      <div className="absolute -bottom-10 -right-10 text-[120px] font-black text-white/5 italic select-none">
        KICKS
      </div>
    </div>
  );
};
