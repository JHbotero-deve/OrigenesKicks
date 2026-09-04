import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ManualRemovalForm } from "@/features/dashboard/ManualRemovalForm";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>No autorizado</div>;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  if (dbUser?.role !== 'ADMIN' && dbUser?.role !== 'SELLER') {
    return <div>Acceso denegado</div>;
  }

  // Obtener todos los productos con sus variantes
  const products = await prisma.product.findMany({
    include: {
      variants: true
    }
  });

  // Filtrar variantes con bajo stock (<= 2)
  const lowStockVariants = products.flatMap(p =>
    p.variants.filter(v => v.stock > 0 && v.stock <= 2).map(v => ({
      ...v,
      productName: p.name,
      imageUrl: p.imageUrl
    }))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Control de Inventario</h1>
          <p className="text-gray-500 text-sm">Monitoreo de existencias y alertas de reposición.</p>
        </div>
      </div>

      {/* Alertas Críticas */}
      {lowStockVariants.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-orange-700">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="font-bold text-lg uppercase italic">Alertas de Stock Crítico (2 o menos)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockVariants.map(variant => (
              <div key={variant.id} className="bg-white p-4 rounded-lg shadow-sm border border-orange-100 flex items-center gap-4">
                {variant.imageUrl && <img src={variant.imageUrl} className="w-12 h-12 object-cover rounded" />}
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase truncate">{variant.productName}</p>
                  <p className="text-[10px] text-gray-500">Talla: {variant.size} | SKU: {variant.sku}</p>
                  <p className="text-sm font-black text-orange-600">¡Solo {variant.stock} disponibles!</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla General de Inventario */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Package className="w-5 h-5" />
          <h2 className="font-bold uppercase text-sm">Resumen General</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-[10px] uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Variante (Talla)</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3 text-center">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.flatMap(p => p.variants.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">{p.name}</td>
                  <td className="px-6 py-4 italic text-gray-600">{v.size}</td>
                  <td className="px-6 py-4 font-mono text-[10px]">{v.sku}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-black ${v.stock <= 2 ? 'text-red-600' : 'text-gray-900'}`}>
                      {v.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {v.stock <= 0 ? (
                      <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Agotado</span>
                    ) : v.stock <= 2 ? (
                      <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Reponer</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">OK</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ManualRemovalForm
                      variantId={v.id}
                      productName={p.name}
                      size={v.size}
                      currentStock={v.stock}
                    />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Volver al Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
