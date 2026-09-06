import prisma from "@/lib/db";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Cpu,
  Globe,
  Plus,
  Activity,
  Database,
  Terminal,
  Zap
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AnalizisMasterPanel() {
  const instances = await prisma.appInstance.findMany({
    include: { stores: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white p-12 font-sans selection:bg-blue-500">
      {/* Header AnalizisEstudio */}
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Cpu size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none">AnalizisEstudio</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em] mt-1">SaaS Core Engine v2.0</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#111] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Systems Online</span>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic text-xs px-8 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            <Plus size={16} className="mr-2" /> Nueva App
          </Button>
        </div>
      </header>

      {/* Stats Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl hover:border-blue-500/30 transition-all group">
          <Activity className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={20} />
          <p className="text-[10px] font-black text-white/40 uppercase mb-1">Clientes Activos</p>
          <p className="text-3xl font-black italic">{instances.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
          <Database className="text-cyan-500 mb-4" size={20} />
          <p className="text-[10px] font-black text-white/40 uppercase mb-1">Total de Sedes</p>
          <p className="text-3xl font-black italic">{instances.reduce((acc, i) => acc + i.stores.length, 0)}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
          <Zap className="text-yellow-500 mb-4" size={20} />
          <p className="text-[10px] font-black text-white/40 uppercase mb-1">Uptime 24/7</p>
          <p className="text-3xl font-black italic text-green-500">99.9%</p>
        </div>
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
          <Terminal className="text-purple-500 mb-4" size={20} />
          <p className="text-[10px] font-black text-white/40 uppercase mb-1">Server Status</p>
          <p className="text-3xl font-black italic text-blue-400">Stable</p>
        </div>
      </div>

      {/* Lista de Aplicaciones Vendidas */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="font-black uppercase italic tracking-tighter text-xl">Gestión de Instancias Clientes</h2>
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Control de Acceso Total
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#050505] text-[10px] font-black uppercase text-white/30 border-b border-white/5">
              <tr>
                <th className="p-6">Negocio / Identidad</th>
                <th className="p-6">Propietario (Email)</th>
                <th className="p-6">Plan</th>
                <th className="p-6">Estado</th>
                <th className="p-6">Sedes</th>
                <th className="p-6 text-right">Acciones de Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {instances.map((instance) => (
                <tr key={instance.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <p className="font-black uppercase italic text-blue-400">{instance.businessName}</p>
                    <p className="text-[9px] text-white/40 mt-1">{instance.subdomain || 'instance_id: ' + instance.id.slice(0,8)}</p>
                  </td>
                  <td className="p-6 text-sm">{instance.ownerEmail}</td>
                  <td className="p-6">
                    <span className="bg-white/5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {instance.planType}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                      instance.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {instance.status === 'ACTIVE' ? '✅ Activo' : '🚫 Suspendido'}
                    </span>
                  </td>
                  <td className="p-6 text-center font-black italic">{instance.stores.length}</td>
                  <td className="p-6 text-right space-x-2">
                    <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-[10px] uppercase font-black">Gestionar</Button>
                    <Button size="sm" className="bg-red-600/20 hover:bg-red-600 text-red-600 hover:text-white text-[10px] uppercase font-black transition-all">Suspender</Button>
                  </td>
                </tr>
              ))}

              {instances.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-white/20 uppercase font-black italic tracking-widest">
                    No has desplegado aplicaciones aún. <br/>
                    <span className="text-blue-500/50 text-[10px]">Utiliza el comando "Nueva App" para iniciar un negocio.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Técnico */}
      <footer className="mt-16 flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
        <div className="flex items-center gap-4">
          <Globe size={14} />
          <span>AnalizisEstudio Global Infrastructure</span>
        </div>
        <span>&copy; 2026 Developed by AnalizisEstudio</span>
      </footer>
    </div>
  );
}
