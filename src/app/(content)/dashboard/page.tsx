"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, dbUser, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 uppercase italic tracking-tighter">Panel de Control - Orígenes Kicks</h1>

      {user ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-black italic text-2xl border-4 border-orange-500">
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-black italic uppercase tracking-tighter">Bienvenido, {dbUser?.name || user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{dbUser?.role || 'CLIENTE'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <a href="/dashboard/orders" className="p-6 border-2 border-gray-100 rounded-2xl hover:border-black transition-all block group">
              <h3 className="font-black uppercase italic text-gray-800 group-hover:text-black">Mis Pedidos</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Revisa tus reservas de 24h y compras confirmadas.</p>
            </a>

            {(dbUser?.role === 'ADMIN' || dbUser?.role === 'SELLER') && (
              <a href="/dashboard/inventory" className="p-6 border-2 border-orange-100 bg-orange-50/20 rounded-2xl hover:border-orange-500 transition-all block group">
                <h3 className="font-black uppercase italic text-orange-700">Stock y Bodega</h3>
                <p className="text-[10px] text-orange-600/60 font-bold uppercase mt-1">Gestión de tallas, entradas y alertas de stock bajo.</p>
              </a>
            )}

            <a href="/products" className="p-6 border-2 border-gray-100 rounded-2xl hover:border-black transition-all block group md:col-span-2 bg-black text-white">
              <h3 className="font-black uppercase italic">Ver Vitrina Principal</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 text-white/50">Explora los nuevos Kicks que llegaron a la fábrica.</p>
            </a>
          </div>

          <Button onClick={() => signOut()} variant="outline" className="w-full py-4 border-2 font-black uppercase italic text-xs tracking-widest">
            Cerrar Sesión del Barrio
          </Button>
        </div>
      ) : (
        <div className="bg-yellow-50 p-10 rounded-3xl border-2 border-dashed border-yellow-200 text-center">
          <p className="mb-6 font-bold uppercase italic text-yellow-800">Aún no has entrado a tu cuenta oficial.</p>
          <Button onClick={() => window.location.href = "/login"} className="bg-black text-white font-black uppercase italic py-4 px-8 rounded-xl">
            Ir al Ingreso Seguro
          </Button>
        </div>
      )}
    </div>
  );
}
