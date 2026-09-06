"use client";

import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export const PublicityStand = () => {
  return (
    <section className="my-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-orange-500 rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl border-4 border-black">
          {/* Decoración Fondo */}
          <div className="absolute top-0 right-0 opacity-10 text-[200px] font-black italic -rotate-12 translate-x-20 -translate-y-20 select-none">
            COLOMBIA
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="bg-black text-white px-4 py-1 rounded-full text-xs font-black uppercase italic tracking-widest mb-6 inline-block">
                Directo de Fábrica 🇨🇴
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-black uppercase italic leading-none mb-6 tracking-tighter">
                Siente el Barrio en cada paso
              </h2>
              <p className="text-black/80 font-bold text-lg mb-8 leading-tight">
                Nuestros Kicks no son importados. Son creados por manos colombianas en nuestro barrio, pensando en tu economía y en que aguanten el trote diario.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/30 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <Award className="text-black mb-2" />
                  <p className="font-black text-xs uppercase">Calidad Local</p>
                  <p className="text-[10px] font-medium uppercase opacity-70 text-black">Insumos 100% Nacionales</p>
                </div>
                <div className="bg-white/30 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <ShieldCheck className="text-black mb-2" />
                  <p className="font-black text-xs uppercase">Garantía Real</p>
                  <p className="text-[10px] font-medium uppercase opacity-70 text-black">Cambios por daños de fábrica</p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-black rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop"
                className="rounded-3xl border-4 border-black relative z-10 transform group-hover:-rotate-2 transition-transform duration-500"
                alt="Producción Nacional"
              />
              <div className="absolute -bottom-6 -right-6 bg-yellow-400 border-4 border-black p-6 rounded-3xl z-20 shadow-xl hidden md:block">
                <p className="text-black font-black italic text-2xl uppercase leading-none">Hecho con<br/>El Corazón</p>
              </div>
            </div>
          </div>
        </div>

        {/* Políticas Claras para el Cliente (SEO) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-8">
          <div className="text-center">
            <Truck className="mx-auto mb-4 text-orange-600" size={32} />
            <h4 className="font-black uppercase italic text-sm mb-2">Entrega de Confianza</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Llegamos a tu puerta. <br/>Pagos seguros en efectivo o transferencia.</p>
          </div>
          <div className="text-center">
            <RotateCcw className="mx-auto mb-4 text-orange-600" size={32} />
            <h4 className="font-black uppercase italic text-sm mb-2">Política de Cambios</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Cuidamos tu inversión. <br/>Cambios únicamente por defectos de fábrica.</p>
          </div>
          <div className="text-center">
            <Award className="mx-auto mb-4 text-orange-600" size={32} />
            <h4 className="font-black uppercase italic text-sm mb-2">Talento del Barrio</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight">Cada compra apoya <br/>el empleo en nuestra comunidad local.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
