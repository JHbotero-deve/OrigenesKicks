import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase-server";
import { approveOrder } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>No autorizado</div>;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SELLER';

  // Si es admin ve todos, si es cliente ve los suyos
  const orders = await prisma.pedido.findMany({
    where: isAdmin ? {} : { clientId: user.id },
    include: {
      client: { select: { name: true, email: true } },
      envio: true,
      items: { include: { variant: { include: { product: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold uppercase italic">Gestión de Pedidos</h1>
        {isAdmin && (
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm">Ver Inventario</Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border p-4 rounded-lg bg-white shadow-sm flex justify-between items-center">
            <div>
              <div className="flex gap-2 mb-1">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  order.status === 'CONFIRMADO' ? 'bg-green-100 text-green-700' :
                  order.status === 'CANCELADO' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
                <span className="text-[10px] text-gray-400">#{order.id.slice(0,8)}</span>
              </div>
              <p className="font-bold">${Number(order.totalAmount).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{order.client.name} ({order.client.email})</p>
              <p className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">
                PAGO: {order.paymentMethod.replace(/_/g, ' ')}
              </p>

              {order.envio && (
                <div className="mt-1 p-2 bg-gray-50 rounded border border-dashed text-[10px] text-gray-600">
                  <p><strong>ENTREGA:</strong> {order.envio.address}, {order.envio.city}</p>
                  <p><strong>TEL:</strong> {order.envio.phone}</p>
                </div>
              )}

              <div className="mt-2">
                {order.items.map(item => (
                  <p key={item.id} className="text-xs text-gray-400">
                    • {item.variant.product.name} - Talla {item.variant.size} (x{item.quantity})
                  </p>
                ))}
              </div>
            </div>

            <div className="text-right">
              {isAdmin && order.status === 'RECIBIDO' && (
                <form action={async () => {
                  "use server";
                  await approveOrder(order.id);
                }}>
                  <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">Aprobar Venta</Button>
                </form>
              )}
              {order.expiresAt && order.status === 'RECIBIDO' && (
                <p className="text-[10px] text-red-500 mt-2">
                  Expira: {new Date(order.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center py-10 text-gray-400">No hay pedidos registrados.</p>
        )}
      </div>
    </div>
  );
}
