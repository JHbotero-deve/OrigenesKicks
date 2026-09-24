"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Search,
  CheckCircle2,
  Package,
  Truck,
  Home,
  Clock,
  XCircle,
} from 'lucide-react';
import { PublicityStand } from '@/components/layout/PublicityStand';

type OrderStatus =
  | 'RECIBIDO'
  | 'CONFIRMADO'
  | 'PROCESANDO'
  | 'DESPACHADO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'RECHAZADO';

type TrackingResponse = {
  success: boolean;
  trackingCode?: string;
  status?: OrderStatus;
  city?: string;
  storePhone?: string | null;
  storeName?: string | null;
  items?: string[];
  message?: string;
};

export default function PosventaPage() {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = orderId.trim();

    if (!code) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: code }),
      });
      const result = (await response.json()) as TrackingResponse;

      if (!response.ok || !result.success) {
        setError(result.message || 'No se pudo consultar el pedido');
        return;
      }

      setOrderData(result);
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'RECIBIDO', icon: Clock, desc: 'Esperando confirmación de pago' },
    { label: 'CONFIRMADO', icon: CheckCircle2, desc: 'Pago verificado con éxito' },
    { label: 'PROCESANDO', icon: Package, desc: 'Tus Kicks están siendo empacados' },
    { label: 'DESPACHADO', icon: Truck, desc: 'En camino a tu dirección' },
    { label: 'ENTREGADO', icon: Home, desc: 'Pedido entregado' },
  ];

  const isClosedOrder = orderData?.status === 'CANCELADO' || orderData?.status === 'RECHAZADO';
  const currentStepIndex = orderData?.status
    ? steps.findIndex((step) => step.label === orderData.status)
    : -1;

  const phone = String(orderData?.storePhone || '').replace(/\D/g, '');
  const whatsappMessage = orderData?.status
    ? `Hola. Mi pedido ${orderData.trackingCode || orderId.trim().toUpperCase()} aparece como ${orderData.status}. Necesito información sobre el envío.`
    : '';

  return (
    <div className="space-y-16 pb-20">
      <section className="mx-4 mt-8 rounded-[3rem] bg-black px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-block rounded-full bg-orange-600 px-4 py-1 text-[9px] font-black uppercase tracking-widest">
            Soporte Orígenes Kicks
          </span>
          <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter md:text-6xl">
            Rastreo de Kicks
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Consulta el estado actual de tu pedido
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4">
        <div className="relative rounded-[2.5rem] border-2 border-gray-100 bg-white p-8 shadow-2xl md:p-12">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded-2xl border-2 border-orange-500 bg-black p-4 text-white shadow-lg">
            <Search size={24} aria-hidden="true" />
          </div>

          <form onSubmit={checkOrder} className="mb-10 space-y-4 pt-4">
            <label htmlFor="order-code" className="sr-only">
              Código de seguimiento
            </label>
            <input
              id="order-code"
              type="text"
              placeholder="Ej. OK-A1B2C3D4E5"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-3xl border-2 border-transparent bg-gray-50 p-6 text-center text-xl font-black uppercase tracking-widest outline-none transition-all focus:border-orange-500"
              required
              minLength={4}
              maxLength={80}
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-black py-8 text-sm font-black uppercase text-white shadow-xl transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Consultando...' : 'Verificar estado del pedido'}
            </Button>
          </form>

          {error && (
            <p className="mb-8 text-center text-xs font-black uppercase text-red-600" role="alert">
              {error}
            </p>
          )}

          {orderData?.success && orderData.items && (
            <div className="space-y-12">
              <div className="flex flex-col justify-between gap-4 rounded-3xl border border-gray-100 bg-gray-50 p-6 md:flex-row md:items-center">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase text-gray-400">Código de seguimiento</p>
                  <p className="text-lg font-black uppercase tracking-widest text-orange-600">{orderData.trackingCode || orderId.trim().toUpperCase()}</p>
                  <p className="mt-3 text-[10px] font-black uppercase text-gray-400">Resumen del pedido</p>
                  <p className="text-lg font-black uppercase">{orderData.items.join(' + ')}</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400">Destino</p>
                  <p className="text-lg font-black uppercase text-orange-600">{orderData.city || 'Medellín'}</p>
                </div>
              </div>

              {isClosedOrder ? (
                <div className="flex flex-col items-center gap-4 rounded-[2rem] border-2 border-red-100 bg-red-50 p-8 text-center">
                  <XCircle className="text-red-600" size={40} aria-hidden="true" />
                  <div>
                    <p className="text-sm font-black uppercase text-red-700">
                      Pedido {orderData.status === 'CANCELADO' ? 'cancelado' : 'rechazado'}
                    </p>
                    <p className="mt-2 text-xs font-bold text-red-500">
                      Este pedido no continuará con el proceso de entrega.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative pt-8">
                  <div className="absolute left-0 top-0 hidden h-1 w-full rounded-full bg-gray-100 md:block" />
                  <div className="relative grid grid-cols-2 gap-8 md:grid-cols-5">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <div
                          key={step.label}
                          className={`flex flex-col items-center text-center ${isCompleted ? 'opacity-100' : 'opacity-30'}`}
                        >
                          <div
                            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${isCurrent ? 'bg-orange-600 text-white shadow-lg' : isCompleted ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
                          >
                            <Icon size={24} aria-hidden="true" />
                          </div>
                          <p
                            className={`mb-1 text-[10px] font-black uppercase leading-none ${isCurrent ? 'text-orange-600' : 'text-gray-800'}`}
                          >
                            {step.label}
                          </p>
                          <p className="px-2 text-[8px] font-bold uppercase leading-tight text-gray-400">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center justify-between gap-4 rounded-[2rem] bg-orange-600 p-6 text-white md:flex-row">
                <p className="text-sm font-black uppercase">¿Necesitas ayuda con el envío?</p>
                {phone ? (
                  <a
                    href={`https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-white px-8 py-3 text-[10px] font-black uppercase text-black transition-transform hover:scale-105"
                  >
                    Hablar con la sucursal
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>

      <PublicityStand />
    </div>
  );
}
