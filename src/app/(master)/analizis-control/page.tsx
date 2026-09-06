"use client";

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Bell,
  Settings,
  Search,
  Plus,
  Activity,
  Zap,
  Crown,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AnalizisCorePanel() {
  const [instances, setInstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Intentar cargar datos de forma segura
  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      // Simulamos carga para asegurar visibilidad inmediata
      // En producción esto llamaría a tu API interna
      setInstances([]);
      setLoading(false);
    } catch (e) {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#E0E0E6] flex font-sans animate-in fade-in duration-700">

      {/* 1. SIDEBAR */}
      <aside className="w-72 bg-[#16161D] border-r border-white/5 flex flex-col p-8 h-screen sticky top-0">
        <div className="mb-12">
          <div className="relative group cursor-pointer aspect-square bg-[#1a1a24] rounded-3xl border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-[#5E5CE6]/10 animate-pulse"></div>
             <img
               src="/analizis-factory.jpg"
               className="relative w-full h-full object-cover"
               alt="Logo"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.parentElement!.innerHTML = '<div class="text-6xl font-black italic text-[#5E5CE6] drop-shadow-[0_0_20px_rgba(94,92,230,0.8)]">A</div>';
               }}
             />
          </div>
          <div className="mt-6 text-center">
            <h1 className="font-black uppercase tracking-tighter text-xl italic text-white leading-none">CORE PANEL</h1>
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] mt-2">AnalizisEstudio Engine</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {['Dashboard', 'Products', 'Clients', 'Analytics'].map(item => (
            <button key={item} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/40 hover:bg-white/5 hover:text-white transition-all">
              {item === 'Dashboard' && <LayoutDashboard size={18} />}
              {item === 'Products' && <Package size={18} />}
              {item === 'Clients' && <Users size={18} />}
              {item === 'Analytics' && <BarChart3 size={18} />}
              {item}
            </button>
          ))}
        </nav>

        <div className="bg-gradient-to-br from-[#1E1E2A] to-[#252538] p-6 rounded-[2rem] border border-white/5 mt-auto">
          <p className="text-xs font-black uppercase italic mb-2">Upgrade to Pro</p>
          <Button className="w-full bg-[#5E5CE6] hover:bg-[#706EE6] text-white rounded-xl py-4 font-black uppercase italic text-[9px]">
            <Crown size={12} className="mr-2" /> Unlock All
          </Button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input type="text" placeholder="Buscar aplicaciones o clientes..." className="w-full bg-[#16161D] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#5E5CE6] transition-all font-bold text-sm" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic text-xs px-8 rounded-xl shadow-lg shadow-blue-900/20">
            <Plus size={16} className="mr-2" /> Nueva App
          </Button>
        </header>

        {error ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center animate-bounce">
              <AlertTriangle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic">Error de Sincronización</h2>
              <p className="text-white/40 text-sm mt-2">No pudimos conectar con el núcleo de datos AnalizisEstudio.</p>
            </div>
            <Button onClick={fetchInstances} className="bg-white text-black font-black uppercase italic text-[10px] px-10 py-4 rounded-xl flex items-center gap-2">
              <RefreshCw size={14} /> Reintentar Conexión
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Revenue', val: '$0', color: 'text-green-500' },
                { label: 'Conversion', val: '0%', color: 'text-blue-500' },
                { label: 'Active Apps', val: '0', color: 'text-purple-500' },
                { label: 'System Load', val: 'Minimal', color: 'text-yellow-500' },
              ].map((s, i) => (
                <div key={i} className="bg-[#16161D] p-8 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                  <p className={`text-2xl font-black italic ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* EMPTY STATE / TABLE */}
            <div className="bg-[#16161D] rounded-[2.5rem] border border-white/5 overflow-hidden">
               <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <h3 className="font-black uppercase italic tracking-tighter text-xl">Instancias Desplegadas</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[8px] font-black uppercase text-white/40">Nucleus Online</span>
                  </div>
               </div>
               <div className="p-20 text-center">
                  <Zap size={48} className="mx-auto text-white/5 mb-6" />
                  <p className="text-white/20 font-black uppercase italic tracking-widest text-sm">
                    Esperando primer despliegue...
                  </p>
                  <p className="text-[10px] text-blue-500/50 mt-2 font-bold uppercase">Usa el botón "Nueva App" para empezar a vender</p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
