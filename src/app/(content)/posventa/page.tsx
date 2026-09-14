'use client'

import React, { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'
import { getPublicOrderStatus } from '@/lib/actions/public'

export default function TrackingPage() {
  const [orderCode, setOrderCode] = useState('')
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStatus(null)

    const res = await getPublicOrderStatus(orderCode)
    if (res.success) {
      setStatus(res)
    } else {
      setError(res.message)
    }
    setLoading(false)
  }

  const steps = [
    { id: 'RECIBIDO', label: 'Pedido Recibido', icon: Clock },
    { id: 'CONFIRMADO', label: 'Pago Confirmado', icon: Package },
    { id: 'DESPACHADO', label: 'En Ruta / Envío', icon: Truck },
    { id: 'ENTREGADO', label: 'Entregado', icon: CheckCircle },
  ]

  const getCurrentStepIndex = () => {
    const statusMap: any = { 'RECIBIDO': 0, 'CONFIRMADO': 1, 'PROCESANDO': 1, 'DESPACHADO': 2, 'ENTREGADO': 3 }
    return statusMap[status?.status] ?? -1
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Rastrea tus Kicks 🚀</h1>
        <p className="text-gray-500 font-medium">Ingresa el código de tu pedido para ver dónde están tus tenis</p>
      </div>

      <form onSubmit={trackOrder} className="flex gap-3 mb-16">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            placeholder="Ej: OK-123 o código de 8 dígitos"
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-black outline-none transition-all font-bold uppercase"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-8 py-4 rounded-2xl font-black italic uppercase hover:bg-orange-600 transition-all disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Rastrear'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center font-bold mb-8 animate-in fade-in">
          {error}
        </div>
      )}

      {status && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-12 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-1000"
                style={{ width: \\%\ }}
              ></div>

              {steps.map((step, idx) => {
                const Icon = step.icon
                const isCompleted = idx <= getCurrentStepIndex()
                const isCurrent = idx === getCurrentStepIndex()

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                    <div className={\w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 \ \\}>
                      <Icon size={24} />
                    </div>
                    <span className={\	ext-[10px] font-black uppercase italic text-center \\}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Estado Actual</p>
              <h2 className="text-2xl font-black italic uppercase text-black">{status.status}</h2>
            </div>
          </div>

          {status.status === 'DESPACHADO' && (
            <div className="bg-black text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-600 rounded-2xl">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase">¡Tus Kicks están en ruta! 🚚</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase">El repartidor ya salió de nuestra bodega</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10">
                  <div className="flex items-start gap-4 mb-4">
                    <MapPin className="text-orange-500 shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Destino de Entrega</p>
                      <p className="text-lg font-bold">{status.city}, Colombia</p>
                    </div>
                  </div>
                  
                  <div className="w-full h-48 bg-gray-800 rounded-2xl overflow-hidden relative border border-white/20">
                    <iframe 
                      src={\https://www.openstreetmap.org/export/embed.html?bbox=-75.6,6.2,-75.5,6.3&layer=map\} 
                      className="w-full h-full grayscale opacity-60"
                      style={{ border: 'none' }}
                    ></iframe>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative">
                        <div className="absolute -inset-4 bg-orange-500/30 rounded-full animate-ping"></div>
                        <div className="bg-orange-600 p-2 rounded-full shadow-2xl border-2 border-white relative z-10">
                          <Truck size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-[10px] font-bold text-gray-500 mt-4 uppercase italic">
                    Actualización en tiempo real simulada • El repartidor llegará pronto
                  </p>
                </div>
              </div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl"></div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black italic uppercase mb-6">Resumen del Pedido</h3>
            <div className="space-y-3">
              {status.items.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black text-xs">
                    {i + 1}
                  </div>
                  <p className="font-bold text-gray-800 uppercase italic">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
