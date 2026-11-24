import prisma from "@/lib/db";
import { requireRole } from "@/lib/auth-guard";
import { ShieldCheck, UserCheck, AlertTriangle, Clock, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const auth = await requireRole(["OWNER", "ADMIN"]);
  if (!auth.ok) {
    return (
      <div className="p-8 text-center text-red-500 font-bold uppercase text-xs">
        Acceso no autorizado a la auditoría del sistema.
      </div>
    );
  }

  const logs = await prisma.adminAccessLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-6 md:p-10 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
            <ShieldCheck className="text-orange-500" size={32} />
            Auditoría de Acceso Administrativo
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Registro en tiempo real de cada intento de ingreso y validación por roles en el Commerce OS.
          </p>
        </div>
        <div className="bg-[#121620] border border-gray-800 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Clock size={18} className="text-orange-500" />
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Registros Auditados</p>
            <p className="text-lg font-black text-white">{logs.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#121620] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <UserCheck size={18} className="text-orange-500" />
            Historial de Accesos al Dashboard
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full">
            Seguridad Activa
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0b0e14] text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800">
                <th className="px-6 py-4 font-bold">Fecha / Hora</th>
                <th className="px-6 py-4 font-bold">Usuario / Email</th>
                <th className="px-6 py-4 font-bold">Rol Detectado</th>
                <th className="px-6 py-4 font-bold">Estado de Acceso</th>
                <th className="px-6 py-4 font-bold">IP / Dispositivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay registros de auditoría de acceso todavía.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSuccess = log.status === "SUCCESS";
                  const isForbidden = log.status === "FORBIDDEN";
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-gray-300 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("es-CO", {
                          dateStyle: "short",
                          timeStyle: "medium",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{log.name || "Sin nombre"}</div>
                        <div className="text-[10px] text-gray-400">{log.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gray-800 text-gray-200">
                          {log.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            AUTORIZADO
                          </span>
                        ) : isForbidden ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            <AlertTriangle size={12} />
                            DENEGADO (CLIENTE)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            NO AUTENTICADO
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-[10px]">
                        <div className="flex items-center gap-1">
                          <Globe size={12} className="text-gray-500" />
                          {log.ipAddress || "Local"}
                        </div>
                        <div className="truncate max-w-[200px] text-gray-500 mt-0.5" title={log.userAgent || ""}>
                          {log.userAgent || "N/A"}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
