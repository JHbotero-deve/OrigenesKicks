import prisma from "@/lib/db";
import { createClient } from "@/lib/supabase-server";
import { approveOrder, updateShippingStatus } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { ShippingStatusController } from "@/components/dashboard/ShippingStatusController";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-20 text-center font-black italic uppercase">No autorizado</div>;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email }
  });

  const isAdmin = dbUser?.role === 'ADMIN' || dbUser?.role === 'SELLER';

  const orders = await prisma.pedido.findMany({
    where: isAdmin ? {} : { clientId: user.id },
    include: {
      client: { select: { name: true, email: true } },
      store: true, // Sucursal asignada
      envio: true,
      items: { include: { variant: { include: { product: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const confirmedOrders = orders.filter(o => o.status === 'CONFIRMADO');
  const totalSales = confirmedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const pendingReservations = orders.filter(o => o.status === 'RECIBIDO').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold uppercase italic tracking-tighter">
          {isAdmin ? "Control de Ventas y Pedidos" : "Mis Compras y Reservas"}
        </h1>
        {isAdmin && (
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm">Revisar Stock del Barrio</Button>
          </Link>
        )}
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black text-white p-4 rounded-xl shadow-lg border-2 border-orange-500">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Caja Total (Ventas Confirmadas)</p>
            <p className="text-3xl font-black italic">${totalSales.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Movimientos Totales</p>
            <p className="text-3xl font-black italic">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-1">Esperando Pago (24h)</p>
            <p className="text-3xl font-black italic">{pendingReservations}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {orders.map(order => {
          // Si el pedido no tiene sucursal, usamos un número por defecto de administración
          const storePhone = order.store?.phone || "573000000000";
          const storeName = order.store?.name || "Administración Central";

          return (
            <div key={order.id} className={`border p-6 rounded-2xl shadow-sm transition-all ${
              order.status === 'CONFIRMADO' ? 'bg-green-50/20 border-green-100' : 'bg-white border-gray-100'
            }`}>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight ${
                      order.status === 'CONFIRMADO' ? 'bg-green-600 text-white' :
                      order.status === 'CANCELADO' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white animate-pulse'
                    }`}>
                      {order.status === 'RECIBIDO' ? '🛒 RESERVADO (24H)' :
                       order.status === 'CONFIRMADO' ? '✅ CONFIRMADO' :
                       order.status === 'CANCELADO' ? '❌ CANCELADO' : order.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-300 tracking-widest">#{order.id.slice(0,8)}</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase border border-blue-200 px-2 py-0.5 rounded">
                      📍 {storeName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase">Monto Total</p>
                      <p className="text-lg font-black italic text-gray-800">${Number(order.totalAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase">Verificación Datos</p>
                      <p className="text-[10px] font-bold text-gray-600 leading-tight">
                        {order.envio?.address}, {order.envio?.city}<br/>
                        <span className="text-blue-500">{order.client.email}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase">Método de Pago</p>
                      <p className="text-xs font-bold text-gray-600 uppercase">{order.paymentMethod.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase">Fecha</p>
                      <p className="text-xs font-bold text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[10px] font-black italic">K</div>
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-gray-700">{item.variant.product.name}</p>
                          <p className="text-[9px] text-gray-400 uppercase">Talla: {item.variant.size} | Color: {item.variant.color} | Cant: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-3 border-l pl-6 min-w-[200px]">
                  {!isAdmin && order.status === 'RECIBIDO' && (
                    <>
                      <a
                        href={`https://wa.me/${storePhone}?text=Hola! Confirmo mi pedido %23${order.id.slice(0,8)}. %0A%0AItems: ${order.items.map(i => i.variant.product.name).join(', ')} %0AValor: $${Number(order.totalAmount).toLocaleString()} %0ADirección: ${order.envio?.address} %0A%0A¿Puedo corregir algún dato o envío el comprobante?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full bg-green-500 hover:bg-green-600 font-black italic text-[11px] uppercase py-6">
                          📱 Verificiar y Enviar al Local
                        </Button>
                      </a>
                      <p className="text-[9px] text-center text-gray-400 uppercase font-bold leading-tight">
                        Este mensaje llegará directamente<br/>a la sucursal de {storeName}
                      </p>
                    </>
                  )}

                  {isAdmin && order.status === 'CONFIRMADO' && order.envio && (
                    <div className="mt-4">
                      <ShippingStatusController 
                        shippingId={order.envio.id} 
                        currentStatus={order.envio.status} 
                      />
                    </div>
                  )}

                  {isAdmin && order.status === 'RECIBIDO' && (
                    <form action={async () => {
                      "use server";
                      await approveOrder(order.id);
                    }} className="w-full">
                      <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 font-black italic text-xs uppercase py-4">
                        ✅ Validar Pago y Facturar
                      </Button>
                    </form>
                  )}

                  {order.status === 'CONFIRMADO' && (
                    <div className="text-center bg-green-50 p-4 rounded-xl border border-green-100">
                      <div className="text-green-600 mb-1">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <p className="text-[10px] font-black text-green-700 uppercase italic">Factura Lista</p>
                      <button className="text-[9px] font-bold text-blue-600 uppercase underline mt-2">Ver Factura Original</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <p className="text-center py-20 text-gray-400 font-black italic uppercase">No hay actividad en este momento.</p>
        )}
      </div>
    </div>
  );
}
