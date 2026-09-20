import { redirect } from "next/navigation";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requireRole } from "@/lib/auth-guard";

export default async function AnalizisCorePanel() {
  const { ok } = await requireRole(["OWNER"]);
  if (!ok) redirect("/login");

  const stats = [
    { label: "Ingresos Totales", val: "$0", color: "text-green-500" },
    { label: "Apps Activas", val: "1", color: "text-blue-500" },
    { label: "Servidores", val: "Online", color: "text-purple-500" },
    { label: "System Load", val: "Bajo", color: "text-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F12] text-[#E0E0E6] flex font-sans selection:bg-blue-500">
      <aside className="w-72 bg-[#16161D] border-r border-white/5 flex flex-col p-8 h-screen sticky top-0">
        <div className="mb-12">
          <div className="relative aspect-square bg-[#1a1a24] rounded-3xl border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[#5E5CE6]/10 animate-pulse" />
            <div className="text-6xl font-black italic text-[#5E5CE6] drop-shadow-[0_0_20px_rgba(94,92,230,0.8)]">A</div>
          </div>
          <div className="mt-6 text-center">
            <h1 className="font-black uppercase tracking-tighter text-xl italic text-white leading-none">AnalizisEstudio</h1>
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em] mt-2">Nucleus Active</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          {["Dashboard", "Clientes", "Licencias", "Ajustes"].map((item) => (
            <button key={item} type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white/40 hover:bg-white/5 hover:text-white transition-all italic uppercase">
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Panel de Control Maestro</h2>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic text-xs px-8 rounded-xl shadow-lg">
            <Plus size={16} className="mr-2" /> Nueva App
          </Button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-[#16161D] p-8 rounded-3xl border border-white/5">
              <p className="text-[10px] font-bold text-white/20 uppercase mb-2">{stat.label}</p>
              <p className={`text-2xl font-black italic ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#16161D] rounded-[2.5rem] border border-white/5 p-20 text-center">
          <Zap size={48} className="mx-auto text-[#5E5CE6] mb-6 opacity-20" />
          <p className="text-white/40 font-black uppercase italic tracking-widest">Núcleo AnalizisEstudio Listo</p>
          <p className="text-[10px] text-blue-500/50 mt-2 font-bold uppercase tracking-widest">Esperando primer cliente real...</p>
        </div>
      </main>
    </div>
  );
}
