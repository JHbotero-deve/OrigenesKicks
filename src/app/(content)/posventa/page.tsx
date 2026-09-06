"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, Truck, RotateCcw, Search, MessageCircle } from 'lucide-react';
import { PublicityStand } from '@/components/layout/PublicityStand';

export default function PosventaPage() {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    // Simulación de búsqueda segura en la base de datos
    setTimeout(() => {
      setStatus({
        id: orderId,
        estado: 'EN BODEGA',
        mensaje: 'Tus Kicks están siendo empacados con cuidado artesanal.'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Header de Confianza */}
      <section className="bg-black text-white py-20 px-4 rounded-[3rem] mx-4 mt-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="bg-orange-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-6 inline-block">
            Soporte de la Casa
          </span>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6">
            Garantía y Seguimiento
          </h1>
          <p className="text-gray-400 font-bold uppercase text-sm leading-tight">
            En Orígenes Kicks no solo vendemos zapatos, cuidamos tus pasos. <br/>
            Calidad 100% colombiana con respaldo real.
          </p>
        </div>
        <div className="absolute top-0 right-0 opacity-5 text-[150px] font-black italic -rotate-12 translate-x-20">
          QUALITY
        </div>
      </section>

      {/* Seguidor de Pedido Seguro */}
      <section className="max-w-3xl mx-auto px-4">
        <div className="bg-white border-2 border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-xl relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-orange-600 text-white p-4 rounded-2xl shadow-lg">
            <Search size={24} />
          </div>

          <div className="text-center mt-4 mb-10">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Rastrea tus Kicks</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Ingresa el código de tu recibo oficial</p>
          </div>

          <form onSubmit={checkOrder} className="space-y-4">
            <input
              type="text"
              placeholder="Ej: FK-1234"
              className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none transition-all font-black text-center text-xl tracking-widest uppercase"
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
            <Button className="w-full py-6 bg-black text-white font-black uppercase italic rounded-2xl shadow-xl hover:bg-orange-600 transition-all">
              {loading ? "Buscando en el sistema..." : "Verificar Estado Real"}
            </Button>
          </form>

          {status && (
            <div className="mt-8 p-6 bg-orange-50 border-2 border-orange-100 rounded-2xl animate-in zoom-in-95 duration-500">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-black italic">
                    OK
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-orange-600 uppercase">Estado del Pedido #{status.id}</p>
                    <p className="text-lg font-black uppercase italic text-gray-800">{status.estado}</p>
                  </div>
               </div>
               <p className="mt-4 text-xs font-bold text-gray-600 italic">"{status.mensaje}"</p>
            </div>
          )}
        </div>
      </section>

      {/* Estante de Publicidad (Integrado) */}
      <PublicityStand />

      {/* Políticas de Posventa */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
           <div className="flex gap-6">
              <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-black">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-black uppercase italic text-lg leading-none mb-2">Garantía de Fábrica</h4>
                <p className="text-xs text-gray-500 font-bold leading-tight uppercase">
                  Nuestros Kicks son 100% nacionales. Cubrimos cualquier daño por pegues o costuras (defecto de fábrica) hasta por 30 días.
                </p>
              </div>
           </div>

           <div className="flex gap-6">
              <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-black">
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 className="font-black uppercase italic text-lg leading-none mb-2">Cambios Honestos</h4>
                <p className="text-xs text-gray-500 font-bold leading-tight uppercase">
                  ¿No te quedó la talla? Hacemos el cambio siempre y cuando el zapato esté nuevo. No hacemos devoluciones de dinero, solo cambios de mercancía.
                </p>
              </div>
           </div>
        </div>

        <div className="bg-yellow-400 p-12 rounded-[3rem] border-4 border-black shadow-2xl transform rotate-1">
           <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-black">¿Necesitas ayuda parcer@?</h3>
           <p className="text-black font-bold mb-8 text-sm uppercase leading-tight">
             Escríbenos directamente y un encargado de la fábrica te atenderá de una. Nada de bots, gente real del barrio.
           </p>
           <a
            href="https://wa.me/573000000000?text=Hola! Necesito ayuda con un pedido de Orígenes Kicks."
            target="_blank"
            className="flex items-center justify-center gap-3 bg-black text-white w-full py-5 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:scale-105 transition-transform"
           >
             <MessageCircle size={20} /> Hablar con Soporte
           </a>
        </div>
      </section>

      <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">
        Propiedad de Orígenes Kicks • Powered by AnalizisEstudio
      </p>
    </div>
  );
}
