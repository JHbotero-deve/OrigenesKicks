import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/Button";
import { FileText, Mail, Download, TrendingUp, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>No autorizado</div>;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: { workStore: true }
  });

  const isAdmin = dbUser?.role === 'ADMIN';

  // Datos para el reporte rápido (últimos 30 días)
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);

  const salesData = await prisma.pedido.findMany({
    where: {
      status: 'CONFIRMADO',
      createdAt: { gte: lastMonth },
      ...(isAdmin ? {} : { storeId: dbUser?.workStoreId || undefined })
    },
    include: { store: true }
  });

  const totalRevenue = salesData.reduce((sum, p) => sum + Number(p.totalAmount), 0);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Centro de Reportes Reales</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Documentos guardables y auditoría de caja</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-2 border-black font-black uppercase italic text-[10px]">
             <Mail className="w-4 h-4 mr-2" /> Enviar al Dueño
           </Button>
        </div>
      </div>

      {/* 3 Niveles de Control */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NIVEL 1: DIARIO */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <Calendar size={24} />
          </div>
          <h3 className="font-black uppercase italic text-xl mb-2 text-gray-800">Cierre Diario</h3>
          <p className="text-xs text-gray-400 font-bold uppercase mb-6 leading-tight">Obligatorio para cada local al finalizar la jornada.</p>
          <div className="space-y-2 mb-8">
            <p className="text-[10px] font-black uppercase">Ventas hoy: <span className="text-orange-600">$1'250.000</span></p>
            <p className="text-[10px] font-black uppercase">Pendientes: <span className="text-gray-400">4 Kicks</span></p>
          </div>
          <Button className="w-full bg-black text-white font-black uppercase italic text-[10px] rounded-xl py-4">
            Generar Cierre Hoy
          </Button>
        </div>

        {/* NIVEL 2: SEMANAL */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp size={24} />
          </div>
          <h3 className="font-black uppercase italic text-xl mb-2 text-gray-800">Control Semanal</h3>
          <p className="text-xs text-gray-400 font-bold uppercase mb-6 leading-tight">Resumen por tienda para administración.</p>
          <div className="space-y-2 mb-8">
            <p className="text-[10px] font-black uppercase">Rendimiento: <span className="text-blue-600">+12% vs anterior</span></p>
            <p className="text-[10px] font-black uppercase">Mejor local: <span className="text-gray-400">Sede Chapinero</span></p>
          </div>
          <Button variant="outline" className="w-full border-2 border-blue-600 text-blue-600 font-black uppercase italic text-[10px] rounded-xl py-4">
            Ver Comparativa
          </Button>
        </div>

        {/* NIVEL 3: MENSUAL */}
        <div className="bg-black p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 text-[100px] font-black italic -rotate-12 translate-x-10 -translate-y-10 text-white select-none">
            MONTH
          </div>
          <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center mb-6 relative z-10">
            <FileText size={24} />
          </div>
          <h3 className="font-black uppercase italic text-xl mb-2 text-white relative z-10">Balance Mensual</h3>
          <p className="text-xs text-white/50 font-bold uppercase mb-6 leading-tight relative z-10">Reporte real para el dueño del negocio.</p>
          <div className="space-y-2 mb-8 relative z-10">
            <p className="text-[10px] font-black uppercase text-white">Ingresos Mes: <span className="text-yellow-400">${totalRevenue.toLocaleString()}</span></p>
            <p className="text-[10px] font-black uppercase text-white">Estado: <span className="text-green-400">Saludable</span></p>
          </div>
          <Button className="w-full bg-yellow-400 text-black font-black uppercase italic text-[10px] rounded-xl py-4 relative z-10 hover:bg-white transition-colors">
            Guardar y Enviar al Correo
          </Button>
        </div>
      </div>

      {/* Tabla de Cierres Pasados (Auditoría) */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-sm">
         <div className="p-6 border-b-2 border-gray-50 flex justify-between items-center">
            <h4 className="font-black uppercase italic text-sm tracking-tighter text-gray-800">Historial de Cierres de Caja</h4>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Últimos 15 registros</span>
         </div>
         <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 border-b">
                <tr>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Local</th>
                  <th className="p-4 text-right">Total Ventas</th>
                  <th className="p-4">Encargado</th>
                  <th className="p-4 text-center">Estado Email</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[11px] font-bold text-gray-600">
                <tr className="hover:bg-orange-50/30 transition-colors">
                  <td className="p-4">{new Date().toLocaleDateString()}</td>
                  <td className="p-4">Sede Principal</td>
                  <td className="p-4 text-right text-orange-600 font-black">$2'340.000</td>
                  <td className="p-4 font-black italic uppercase">Camilo V.</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">ENVIADO</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-gray-400 hover:text-black transition-colors"><Download size={16} /></button>
                  </td>
                </tr>
                {/* Más filas se cargarían dinámicamente aquí */}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
