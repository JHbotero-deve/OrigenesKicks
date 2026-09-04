"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Orígenes Kicks</h1>

      {user ? (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <p className="mb-2"><strong>Bienvenido,</strong> {user.email}</p>
          <p className="text-sm text-gray-500 mb-6">ID de Usuario: {user.id}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <a href="/dashboard/orders" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors block">
              <h3 className="font-bold">Mis Pedidos</h3>
              <p className="text-xs text-gray-500">Consulta el estado de tus reservas y compras.</p>
            </a>

            {(dbUser?.role === 'ADMIN' || dbUser?.role === 'SELLER') && (
              <a href="/dashboard/inventory" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors block border-orange-200 bg-orange-50/30">
                <h3 className="font-bold text-orange-700">Gestión de Inventario</h3>
                <p className="text-xs text-gray-500">Control de stock, alertas y reposición de Kicks.</p>
              </a>
            )}

            <a href="/products" className="p-4 border rounded-lg hover:bg-gray-50 transition-colors block">
              <h3 className="font-bold">Ir a la Vitrina</h3>
              <p className="text-xs text-gray-500">Busca tus próximos Kicks.</p>
            </a>
          </div>

          <Button onClick={() => signOut()} variant="outline">Cerrar Sesión</Button>
        </div>
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <p className="mb-4">No has iniciado sesión.</p>
          <Button onClick={() => window.location.href = "/login"}>Ir al Login</Button>
        </div>
      )}
    </div>
  );
}
