import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  if (dbUser?.role !== 'ADMIN') {
    return <div className="p-8 text-center font-bold text-red-600">ACCESO DENEGADO: Solo el Propietario puede auditar los registros.</div>;
  }

  const logs = await prisma.inventoryLog.findMany({
    include: {
      variant: { include: { product: true } },
      performedBy: { select: { name: true, email: true, role: true } },
      provider: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Últimos 100 movimientos
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b-2 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Seguridad Auditada</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Kardex Centralizado de Movimientos</p>
        </div>
        <div className="text-right">
          <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-1 rounded">MODO AUDITORÍA ACTIVO</span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="p-4">Fecha/Hora</th>
              <th className="p-4">Usuario/Responsable</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Producto (Talla/Color)</th>
              <th className="p-4">Cant.</th>
              <th className="p-4">Motivo / Proveedor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-[11px] font-bold text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  <p className="text-xs font-black uppercase italic">{log.performedBy.name}</p>
                  <p className="text-[9px] text-gray-400">{log.performedBy.email} ({
                    log.performedBy.role === 'ADMIN' ? 'ADMINISTRADOR' :
                    log.performedBy.role === 'SELLER' ? 'VENDEDOR' :
                    log.performedBy.role === 'DELIVERY' ? 'REPARTO' : 'CLIENTE'
                  })</p>
                </td>
                <td className="p-4">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                    log.changeType === 'SALE' ? 'bg-green-100 text-green-700' :
                    log.changeType === 'PURCHASE' ? 'bg-blue-100 text-blue-700' :
                    log.changeType === 'RESERVATION' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {log.changeType === 'SALE' ? 'VENTA' :
                     log.changeType === 'PURCHASE' ? 'COMPRA' :
                     log.changeType === 'RESERVATION' ? 'RESERVA' :
                     log.changeType === 'RETURN' ? 'DEVOLUCIÓN' : 'AJUSTE'}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-xs font-bold text-gray-800">{log.variant.product.name}</p>
                  <p className="text-[9px] text-gray-400 uppercase">Talla: {log.variant.size} | Color: {log.variant.color}</p>
                </td>
                <td className="p-4 font-black italic">
                  {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                </td>
                <td className="p-4">
                  <p className="text-[10px] text-gray-600 font-medium">{log.reason}</p>
                  {log.provider && (
                    <p className="text-[9px] text-blue-600 font-black uppercase mt-0.5">🚚 {log.provider.name}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
