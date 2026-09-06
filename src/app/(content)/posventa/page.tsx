"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getPublicOrderStatus } from '@/lib/actions';
import {
  ShieldCheck,
  RotateCcw,
  Search,
  MessageCircle,
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock
} from 'lucide-react';
import { PublicityStand } from '@/components/layout/PublicityStand';

export default function PosventaPage() {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setError('');

    const res = await getPublicOrderStatus(orderId);

    if (res.success) {
      setOrderData(res);
    } else {
      setError(res.message || 'Error desconocido');
      setOrderData(null);
    }
    setLoading(false);
  };

  const steps = [
    { label: 'RECIBIDO', icon: Clock, desc: 'Esperando confirmación de pago' },
    { label: 'CONFIRMADO', icon: CheckCircle2, desc: 'Pago verificado con éxito' },
    { label: 'PROCESANDO', icon: Package, desc: 'Tus Kicks están siendo empacados' },
    { label: 'DESPACHADO', icon: Truck, desc: 'En camino a tu dirección' },
    { label: 'ENTREGADO', icon: Home, desc: '¡Disfruta tus nuevos Kicks!' }
  ];

  const currentStepIndex = orderData ? steps.findIndex(s => s.label === orderData.status) : -1;

  return (
    <div className="space-y-16 pb-20">
      <section className="bg-black text-white py-16 px-4 rounded-[3rem] mx-4 mt-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="bg-orange-600 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-6 inline-block">Soporte AnalizisEstudio</span>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">Rastreo de Kicks</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Información real de tu pedido directo de la fábrica</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-white border-2 border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white p-4 rounded-2xl shadow-lg border-2 border-orange-500">
            <Search size={24} />
          </div>

          <form onSubmit={checkOrder} className="space-y-4 mb-10 pt-4">
            <input
              type="text"
              placeholder="Pega aquí el código de tu pedido (Ej: 8a2f1b)"
              className="w-full p-6 bg-gray-50 rounded-3xl border-2 border-transparent focus:border-orange-500 outline-none transition-all font-black text-center text-xl tracking-widest uppercase shadow-inner"
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
            <Button className="w-full py-8 bg-black text-white font-black uppercase italic rounded-2xl shadow-xl hover:bg-orange-600 transition-all text-sm">
              {loading ? "CONSULTANDO BODEGA..." : "VERIFICAR ESTADO DE MIS KICKS"}
            </Button>
          </form>

          {error && <p className="text-center text-red-600 font-black uppercase italic text-xs mb-8">❌ {error}</p>}

          {orderData && (
            <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Resumen del Pedido</p>
                  <p className="text-lg font-black italic uppercase">{orderData.items.join(' + ')}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Destino</p>
                  <p className="text-lg font-black italic uppercase text-orange-600">{orderData.city}</p>
                </div>
              </div>

              {/* LÍNEA DE TIEMPO VISUAL */}
              <div className="relative pt-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 rounded-full hidden md:block"></div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.label} className={`flex flex-col items-center text-center ${isCompleted ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-700 ${
                          isCurrent ? 'bg-orange-600 text-white scale-110 shadow-lg shadow-orange-500/40 rotate-3' :
                          isCompleted ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon size={24} />
                        </div>
                        <p className={`text-[10px] font-black uppercase italic leading-none mb-1 ${isCurrent ? 'text-orange-600' : 'text-gray-800'}`}>
                          {step.label}
                        </p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase leading-tight px-2">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-orange-600 p-6 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-4">
                 <p className="text-sm font-black italic uppercase">¿Alguna duda con el envío?</p>
                 <a href={`https://wa.me/573000000000?text=Hola! Mi pedido #${orderId} dice que está ${orderData.status}. ¿Me dan más info?`} target="_blank" className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase italic text-[10px] hover:scale-105 transition-transform">
                   Hablar con la Sucursal
                 </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <PublicityStand />
    </div>
  );
}
