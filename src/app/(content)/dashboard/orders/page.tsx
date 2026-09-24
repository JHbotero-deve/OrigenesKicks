import prisma from "@/lib/db";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import { releaseExpiredReservationsInternal } from "@/lib/reservations";
import { approveOrder } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { ShippingStatusController } from "@/components/dashboard/ShippingStatusController";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const auth = await requireAuthenticatedUser();
  if (!auth.ok || !auth.dbUser) return null;

  await releaseExpiredReservationsInternal();

  const isStaff = ["OWNER", "ADMIN", "SELLER", "DELIVERY"].includes(auth.dbUser.role);
  const canApprovePayments = auth.dbUser.role === "OWNER" || auth.dbUser.role === "ADMIN";

  const orders = await prisma.pedido.findMany({
    where: isStaff ? (
      auth.dbUser.role === "OWNER" ? {} : { storeId: auth.dbUser.workStoreId ?? undefined }
    ) : { clientId: auth.dbUser.id },
    include: {
      client: { select: { name: true, email: true } },
      store: true,
      envio: true,
      factura: { select: { id: true, fullNumber: true } },
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const confirmedOrders = orders.filter((order) => ["CONFIRMADO","PROCESANDO","DESPACHADO","ENTREGADO"].includes(order.status));
  const totalSales = confirmedOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const pendingReservations = orders.filter((order) => order.status === "RECIBIDO").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter sm:text-3xl">{isStaff ? "Pedidos y ventas" : "Mis compras y reservas"}</h1>
          <p className="mt-1 text-xs text-gray-500">{isStaff ? "Cada reserva, venta y salida queda registrada." : "Consulta el estado de tus pedidos y reservas de 24 horas."}</p>
        </div>
        {isStaff && <Link href="/dashboard/inventory"><Button variant="outline" size="sm">Ver inventario</Button></Link>}
      </div>

      {isStaff && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-black p-5 text-white"><p className="text-[9px] font-black uppercase tracking-widest text-orange-500">Ventas registradas</p><p className="mt-1 text-2xl font-black italic">{"$"}{totalSales.toLocaleString("es-CO")}</p></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5"><p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Movimientos</p><p className="mt-1 text-2xl font-black italic">{orders.length}</p></div>
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5"><p className="text-[9px] font-black uppercase tracking-widest text-orange-600">Reservas activas</p><p className="mt-1 text-2xl font-black italic">{pendingReservations}</p></div>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const isPending = order.status === "RECIBIDO";
          const storePhone = order.store?.phone?.replace(/\D/g, "");
          const isWompiPending = order.paymentMethod === "WOMPI" && order.paymentStatus !== "APPROVED";

          return (
            <article key={order.id} className="rounded-[1.8rem] border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={"rounded-full px-3 py-1 text-[9px] font-black uppercase " + (order.status === "CONFIRMADO" ? "bg-green-600 text-white" : order.status === "CANCELADO" || order.status === "RECHAZADO" ? "bg-red-600 text-white" : "bg-orange-500 text-white")}>
                    {isPending ? "RESERVADO · 24H" : order.status}
                  </span>
                  <span className="font-mono text-[9px] font-bold text-gray-400">#{order.id.slice(0,8).toUpperCase()}</span>
                  {order.store?.name && <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[8px] font-black uppercase text-blue-700">{order.store.name}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div><p className="meta-label">Total</p><p className="text-lg font-black italic">{"$"}{Number(order.totalAmount).toLocaleString("es-CO")}</p></div>
                  <div><p className="meta-label">Pago</p><p className="text-[10px] font-black uppercase text-gray-700">{order.paymentMethod?.replace(/_/g," ") || "Pendiente"}</p><p className="text-[9px] text-gray-400">{order.paymentStatus || "PENDING"}</p></div>
                  <div><p className="meta-label">Fecha</p><p className="text-[10px] font-bold text-gray-700">{new Date(order.createdAt).toLocaleString("es-CO")}</p></div>
                  <div><p className="meta-label">Cliente</p><p className="truncate text-[10px] font-bold text-gray-700">{order.client.name || order.client.email}</p></div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                  {order.items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white">{item.variant.product.imageUrl && <img src={item.variant.product.imageUrl} alt="" className="h-full w-full object-cover" />}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-xs font-black uppercase">{item.variant.product.name}</p><p className="text-[9px] uppercase text-gray-500">Talla {item.variant.size || "-"} · {item.variant.color || "-"} · {item.quantity} unidad(es)</p></div>
                  </div>)}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {!isStaff && isPending && storePhone && (
                    <a href={"https://wa.me/" + storePhone + "?text=" + encodeURIComponent("Hola. Confirmo mi pedido #" + order.id.slice(0,8).toUpperCase())} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-green-600 py-4 text-xs font-black uppercase text-white hover:bg-green-700">Confirmar por WhatsApp</Button>
                    </a>
                  )}

                  {canApprovePayments && isPending && (
                    <form action={async () => { "use server"; await approveOrder(order.id); }}>
                      <Button type="submit" disabled={isWompiPending} className="w-full bg-black py-4 text-xs font-black uppercase italic text-white hover:bg-orange-600">
                        {isWompiPending ? "Esperando aprobación Wompi" : "Validar pago y facturar"}
                      </Button>
                    </form>
                  )}

                  {isStaff && order.envio && ["CONFIRMADO","PROCESANDO","DESPACHADO"].includes(order.status) && (
                    <ShippingStatusController shippingId={order.envio.id} currentStatus={order.envio.status} />
                  )}

                  {order.factura && <a href={"/api/invoice/" + order.factura.id} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center rounded-2xl border-2 border-gray-900 px-4 py-3 text-[10px] font-black uppercase italic">Ver recibo {order.factura.fullNumber}</a>}
                </div>

                {isPending && order.expiresAt && <p className="text-[9px] font-bold uppercase tracking-wide text-orange-600">Reserva válida hasta {new Date(order.expiresAt).toLocaleString("es-CO")}. Si vence sin pago/confirmación, el stock vuelve a estar disponible.</p>}
              </div>
            </article>
          );
        })}

        {orders.length === 0 && <div className="rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center text-sm font-black uppercase italic text-gray-400">No hay pedidos registrados.</div>}
      </div>
    </div>
  );
}
