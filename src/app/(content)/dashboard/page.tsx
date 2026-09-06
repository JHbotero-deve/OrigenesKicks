"use client";

import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical
} from "lucide-react";

export default function DashboardPage() {
  const { user, dbUser, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const isStaff = dbUser?.role === 'ADMIN' || dbUser?.role === 'SELLER';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. HEADER CON PERFIL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="w-20 h-20 bg-black text-white rounded-[2rem] flex items-center justify-center font-black italic text-3xl border-4 border-orange-500 shadow-2xl rotate-3">
               {user?.email?.[0].toUpperCase()}
             </div>
             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
              Resumen <span className="text-orange-600">Operativo</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2">
              {dbUser?.name || 'Propietario'} • {dbUser?.role || 'ADMIN'} • AnalizisEstudio Verified
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-2 font-black uppercase italic text-[10px] px-6">Exportar</Button>
          <Button onClick={() => signOut()} className="bg-black text-white rounded-2xl font-black uppercase italic text-[10px] px-6 shadow-xl shadow-gray-200">Cerrar Sesión</Button>
        </div>
      </div>

      {/* 2. STATS GRID (ESTILO IMAGEN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Ventas del Mes', val: '$12.4M', inc: '+15%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pedidos Hoy', val: '24', inc: '+4', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Stock Bodega', val: '842', inc: 'Bajo', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Clientes Nuevos', val: '156', inc: '+12%', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`${s.bg} ${s.color} p-3 rounded-2xl`}>
                <s.icon size={20} />
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                {s.inc}
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black italic mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      {/* 3. MIDDLE SECTION (CHART SIMULATION + ACTIVITY) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* GRÁFICA VISUAL (Estilo la imagen enviada) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black uppercase italic tracking-tighter text-xl">Flujo de Ingresos</h3>
            <div className="flex gap-2">
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full"></div><span className="text-[8px] font-bold uppercase text-gray-400">Ventas</span></div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-200 rounded-full"></div><span className="text-[8px] font-bold uppercase text-gray-400">Gastos</span></div>
            </div>
          </div>

          {/* Simulación de Barras de la imagen */}
          <div className="h-64 flex items-end justify-between gap-2 px-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
               <div className="border-t border-black w-full"></div>
               <div className="border-t border-black w-full"></div>
               <div className="border-t border-black w-full"></div>
            </div>
            {[40, 70, 45, 90, 65, 80, 50, 95, 60, 75, 40, 85].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full bg-gray-100 rounded-t-xl group-hover:bg-orange-500 transition-all duration-500 cursor-pointer relative"
                >
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                     $1.2M
                   </div>
                </div>
                <p className="text-[7px] font-black text-gray-300 text-center mt-4 uppercase">Mes {i+1}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="bg-black text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 text-[120px] font-black italic rotate-90 translate-x-20 text-white select-none">
            LIVE
          </div>
          <h3 className="font-black uppercase italic tracking-tighter text-xl mb-8 relative z-10">Últimos Movimientos</h3>
          <div className="space-y-6 relative z-10">
            {[
              { type: 'VENTA', msg: 'Jordan 4 Retro a Medellín', time: 'hace 5 min', icon: CheckCircle2, color: 'text-green-400' },
              { type: 'RESERVA', msg: 'Vans Old Skool pendiente', time: 'hace 12 min', icon: Clock, color: 'text-orange-400' },
              { type: 'STOCK', msg: 'Bajo stock en Sede Centro', time: 'hace 1 h', icon: AlertCircle, color: 'text-red-400' },
              { type: 'VENTA', msg: 'Puma RS-X a Bogotá', time: 'hace 2 h', icon: CheckCircle2, color: 'text-green-400' },
            ].map((m, i) => (
              <div key={i} className="flex gap-4 items-start group cursor-pointer">
                <div className={`mt-1 ${m.color}`}><m.icon size={16} /></div>
                <div className="flex-1 border-b border-white/10 pb-4 group-last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full bg-white/10 ${m.color}`}>{m.type}</span>
                    <span className="text-[8px] text-white/30 font-bold uppercase">{m.time}</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-tight text-white/80">{m.msg}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 text-[9px] font-black uppercase italic tracking-[0.3em] text-white/40 hover:text-orange-500 transition-colors">
            Ver Todo el Kardex <ArrowUpRight size={10} className="inline ml-1" />
          </button>
        </div>

      </div>

      {/* 4. SECCIÓN DE ACCESO RÁPIDO */}
      <div className="bg-white p-8 rounded-[3rem] border border-gray-100">
        <h3 className="font-black uppercase italic tracking-tighter text-xl mb-8 px-4">Accesos Directos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
            { name: 'Pedidos', href: '/dashboard/orders', icon: ShoppingCart },
            { name: 'Bodega', href: '/dashboard/inventory', icon: Package },
            { name: 'Reportes', href: '/dashboard/reports', icon: FileText },
            { name: 'Equipo', href: '/dashboard/users', icon: Users },
           ].map((a, i) => (
             <a key={i} href={a.href} className="p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-black hover:bg-white transition-all group">
                <a.icon className="mb-4 text-gray-400 group-hover:text-orange-600 transition-colors" size={24} />
                <p className="font-black uppercase italic text-xs tracking-tighter">{a.name}</p>
             </a>
           ))}
        </div>
      </div>

    </div>
  );
}
