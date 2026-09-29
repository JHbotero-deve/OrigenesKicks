import Link from "next/link";
import prisma from "@/lib/db";
import { requireAuthenticatedUser } from "@/lib/auth-guard";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Download,
  FileText,
  Filter,
  MousePointerClick,
  Package,
  PackagePlus,
  Plus,
  ReceiptText,
  ShoppingCart,
  SlidersHorizontal,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["RECIBIDO", "CONFIRMADO", "PROCESANDO", "DESPACHADO", "ENTREGADO"] as const;

const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
const compactMoney = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", notation: "compact", maximumFractionDigits: 1 }).format(value);
const pct = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
const month = (date: Date) => new Intl.DateTimeFormat("es-CO", { month: "short" }).format(date).replace(".", "").toUpperCase();
const dateRange = (date: Date) => `01–${new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()} ${new Intl.DateTimeFormat("es-CO", { month: "short" }).format(date).replace(".", "")} ${date.getFullYear()}`;
const initials = (name?: string | null) => (name || "CL").split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();

const statusStyle = (status: string) => {
  if (status === "ENTREGADO") return "bg-[#17271a] text-[#b6f23a]";
  if (status === "DESPACHADO") return "bg-[#142733] text-[#37d7ff]";
  if (status === "PROCESANDO" || status === "CONFIRMADO") return "bg-[#2b2113] text-[#ffb84a]";
  return "bg-[#1a1f29] text-[#8c97a8]";
};

const statusLabel = (status: string) => ({
  RECIBIDO: "Recibido",
  CONFIRMADO: "Confirmado",
  PROCESANDO: "Procesando",
  DESPACHADO: "Enviado",
  ENTREGADO: "Entregado",
}[status] || status);

export default async function DashboardPage() {
  const auth = await requireAuthenticatedUser();

  if (!auth.ok || !auth.dbUser) {
    return <div className="p-8 text-sm text-[#8c97a8]">Sesión no disponible.</div>;
  }

  const user = auth.dbUser;
  const globalRole = user.role === "OWNER" || user.role === "ADMIN";
  const storeId = globalRole ? null : user.workStoreId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfYearWindow = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const [orders, variants, clients] = await Promise.all([
    prisma.pedido.findMany({
      where: { createdAt: { gte: startOfYearWindow, lt: startOfNextMonth }, ...(storeId ? { storeId } : {}) },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingCode: true,
        status: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        customerName: true,
        customerEmail: true,
        client: { select: { name: true, email: true } },
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            variant: { select: { sku: true, product: { select: { name: true, imageUrl: true } } } },
          },
        },
      },
    }),
    prisma.variant.findMany({
      where: { active: true, ...(storeId ? { storeId } : {}) },
      select: { id: true, sku: true, stock: true, product: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { role: "CLIENT", createdAt: { gte: startOfPreviousMonth } },
      select: { id: true, createdAt: true },
    }),
  ]);

  const activeOrders = orders.filter((order) => ACTIVE_STATUSES.includes(order.status as (typeof ACTIVE_STATUSES)[number]));
  const currentOrders = activeOrders.filter((order) => order.createdAt >= startOfMonth && order.createdAt < startOfNextMonth);
  const previousOrders = activeOrders.filter((order) => order.createdAt >= startOfPreviousMonth && order.createdAt < startOfMonth);
  const currentSales = currentOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const previousSales = previousOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const salesChange = previousSales ? ((currentSales - previousSales) / previousSales) * 100 : 0;
  const ordersChange = previousOrders.length ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;
  const ticket = currentOrders.length ? currentSales / currentOrders.length : 0;
  const previousTicket = previousOrders.length ? previousSales / previousOrders.length : 0;
  const ticketChange = previousTicket ? ((ticket - previousTicket) / previousTicket) * 100 : 0;
  const newClients = clients.filter((client) => client.createdAt >= startOfMonth).length;
  const previousClients = clients.filter((client) => client.createdAt >= startOfPreviousMonth && client.createdAt < startOfMonth).length;
  const clientChange = previousClients ? ((newClients - previousClients) / previousClients) * 100 : 0;
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const lowStock = variants.filter((variant) => variant.stock <= 3).sort((a, b) => a.stock - b.stock).slice(0, 3);

  const months = Array.from({ length: 12 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 11 + index, 1));
  const chart = months.map((date) => {
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { label: month(date), value: activeOrders.filter((order) => order.createdAt >= date && order.createdAt < end).reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) };
  });
  const maxChart = Math.max(...chart.map((item) => item.value), 1);

  const products = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of currentOrders) {
    for (const item of order.items) {
      const name = item.variant.product.name;
      const previous = products.get(name) || { name, quantity: 0, revenue: 0 };
      previous.quantity += item.quantity;
      previous.revenue += item.quantity * Number(item.unitPrice);
      products.set(name, previous);
    }
  }
  const topProducts = [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 4);

  const channels = new Map<string, number>();
  for (const order of currentOrders) {
    const channel = order.paymentMethod || "Otros";
    channels.set(channel, (channels.get(channel) || 0) + Number(order.totalAmount || 0));
  }
  const channelData = [...channels.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const channelTotal = channelData.reduce((sum, [, value]) => sum + value, 0) || 1;

  const recentOrders = currentOrders.slice(0, 5);
  const goalSales = 2000000;
  const goalOrders = 4500;
  const salesGoal = Math.min(100, (currentSales / goalSales) * 100);
  const orderGoal = Math.min(100, (currentOrders.length / goalOrders) * 100);

  const stats = [
    { label: "Ingresos netos", value: money(currentSales), change: pct(salesChange), icon: CircleDollarSign, accent: "text-[#b6f23a]", bars: [13,18,15,24,21,29,34] },
    { label: "Pedidos", value: currentOrders.length.toLocaleString("es-CO"), change: pct(ordersChange), icon: ShoppingCart, accent: "text-[#37d7ff]", bars: [12,17,20,16,25,28,31] },
    { label: "Ticket promedio", value: compactMoney(ticket), change: pct(ticketChange), icon: ReceiptText, accent: "text-[#8d78ff]", bars: [18,16,19,22,21,25,28] },
    { label: "Clientes nuevos", value: newClients.toLocaleString("es-CO"), change: pct(clientChange), icon: MousePointerClick, accent: "text-[#ffb84a]", bars: [11,14,13,18,24,22,27] },
  ];

  return (
    <div className="min-h-screen">
      <header className="flex min-h-[104px] flex-col justify-between gap-5 border-b border-[#202936] px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:py-0">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.08em]">
            <span className="text-[#5f6978]">Commerce OS</span><span className="text-[#5f6978]">/</span><span className="text-[#b6f23a]">Resumen</span>
          </div>
          <h1 className="mt-1 font-['Space_Grotesk'] text-[26px] text-[#f5f7fa]">Centro de ventas</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex h-[38px] items-center gap-2 rounded-[10px] border border-[#2c3747] bg-[#0e121a] px-4 text-xs text-[#f5f7fa]"><CalendarDays size={15} />{dateRange(now)}<ChevronDown size={13} /></button>
          <button className="flex h-[38px] items-center gap-2 rounded-[10px] border border-[#2c3747] bg-[#161d29] px-4 text-xs font-bold text-[#f5f7fa]"><SlidersHorizontal size={15} />Filtros</button>
          <button className="flex h-[38px] items-center gap-2 rounded-[10px] border border-[#2c3747] bg-[#161d29] px-4 text-xs font-bold text-[#f5f7fa]"><Download size={15} />Exportar</button>
          <Link href="/dashboard/products" className="flex h-[38px] items-center gap-2 rounded-[10px] bg-[#b6f23a] px-4 text-xs font-bold text-black"><Plus size={15} />Nuevo producto</Link>
          <button className="flex size-[38px] items-center justify-center rounded-[10px] border border-[#2c3747] bg-[#161d29] text-[#f5f7fa]" aria-label="Notificaciones"><Bell size={17} /></button>
        </div>
      </header>

      <main className="space-y-6 px-5 py-6 sm:px-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#8c97a8]">Rendimiento global de la tienda · todos los canales</p>
            <p className="hidden items-center gap-2 text-[10px] text-[#8c97a8] sm:flex"><span className="size-[7px] rounded-full bg-[#b6f23a]" />Datos actualizados ahora</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="dashboard-card h-[146px] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[#8c97a8]">{stat.label}</p>
                    <span className="flex size-7 items-center justify-center rounded-md bg-[#161d29]"><Icon size={14} className={stat.accent} /></span>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="font-['Space_Grotesk'] text-[28px] text-[#f5f7fa]">{stat.value}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px]">
                        <span className={`flex items-center gap-1 ${stat.accent}`}><TrendingUp size={12} />{stat.change}</span>
                        <span className="text-[#5f6978]">vs. mes anterior</span>
                      </div>
                    </div>
                    <div className="flex h-[34px] items-end gap-1">
                      {stat.bars.map((height, index) => <span key={index} className={`w-[7px] rounded-[6px] ${index === stat.bars.length - 1 ? `bg-[currentColor] ${stat.accent}` : "bg-[#2c3747]"}`} style={{ height }} />)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
          <div className="dashboard-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><h2 className="dashboard-title">Flujo de ventas</h2><p className="mt-1 text-xs text-[#5f6978]">Ingresos registrados por mes</p></div>
              <div className="flex rounded-lg bg-[#161d29] p-1 text-[10px] font-semibold text-[#5f6978]"><span className="rounded-md bg-[#2c3747] px-3 py-1 text-[#f5f7fa]">12M</span><span className="px-3 py-1">6M</span><span className="px-3 py-1">3M</span></div>
            </div>
            <div className="mt-7 flex h-[210px] items-end gap-2 border-b border-[#202936]">
              {chart.map((item, index) => (
                <div key={item.label + index} className="group flex h-full flex-1 flex-col justify-end">
                  <div className="relative flex h-full items-end">
                    <div className={`w-full rounded-t-[7px] ${index === chart.length - 1 ? "bg-[#b6f23a]" : "bg-[#2c3747]"} transition-opacity group-hover:opacity-80`} style={{ height: `${Math.max((item.value / maxChart) * 100, item.value ? 4 : 1)}%` }}>
                      <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#f5f7fa] px-2 py-1 text-[9px] font-bold text-black group-hover:block">{money(item.value)}</span>
                    </div>
                  </div>
                  <span className="mt-3 text-center text-[9px] text-[#5f6978]">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-[#8c97a8]"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#b6f23a]" />Este mes</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-[#2c3747]" />Histórico</span></div>
          </div>

          <div className="dashboard-card p-5 sm:p-6">
            <div><h2 className="dashboard-title">Productos destacados</h2><p className="mt-1 text-xs text-[#5f6978]">Mayor aporte al ingreso del mes</p></div>
            <div className="mt-6 space-y-4">
              {topProducts.length ? topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="w-4 text-[10px] text-[#5f6978]">0{index + 1}</span>
                  <div className="flex size-10 items-center justify-center rounded-[10px] border border-[#202936] bg-[#161d29]"><Package size={18} className="text-[#8c97a8]" /></div>
                  <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#f5f7fa]">{product.name}</p><p className="mt-1 text-[10px] text-[#5f6978]">{product.quantity} unidades</p></div>
                  <p className="text-xs font-semibold text-[#f5f7fa]">{compactMoney(product.revenue)}</p>
                </div>
              )) : <p className="py-8 text-center text-xs text-[#5f6978]">Aún no hay ventas del mes.</p>}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="dashboard-card p-5 sm:p-6">
            <div><h2 className="dashboard-title">Participación por canal</h2><p className="mt-1 text-xs text-[#5f6978]">Distribución de ingresos del periodo</p></div>
            <div className="mt-7 grid gap-6 sm:grid-cols-[140px_1fr] sm:items-center">
              <div className="mx-auto flex size-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(#b6f23a 0 48%, #37d7ff 48% 77%, #8d78ff 77% 91%, #ffb84a 91% 100%)` }}>
                <div className="flex size-20 flex-col items-center justify-center rounded-full bg-[#0e121a]"><span className="font-['Space_Grotesk'] text-lg text-[#f5f7fa]">{compactMoney(channelTotal)}</span><span className="text-[8px] uppercase text-[#5f6978]">total</span></div>
              </div>
              <div className="space-y-4">
                {channelData.length ? channelData.map(([name, value], index) => {
                  const colors = ["bg-[#b6f23a]", "bg-[#37d7ff]", "bg-[#8d78ff]", "bg-[#ffb84a]"];
                  return <div key={name} className="flex items-center justify-between text-[10px]"><span className="flex items-center gap-2 text-[#8c97a8]"><i className={`size-[6px] rounded-full ${colors[index]}`} />{name}</span><span className="text-[#f5f7fa]">{compactMoney(value)} · {Math.round((value / channelTotal) * 100)}%</span></div>;
                }) : <p className="text-xs text-[#5f6978]">Sin pagos registrados.</p>}
              </div>
            </div>
          </div>

          <div className="dashboard-card p-5 sm:p-6">
            <div><h2 className="dashboard-title">Metas del mes</h2><p className="mt-1 text-xs text-[#5f6978]">Seguimiento del objetivo operativo</p></div>
            <div className="mt-7 space-y-7">
              <Goal label="Ingresos" value={`${money(currentSales)} / ${money(goalSales)}`} progress={salesGoal} />
              <Goal label="Pedidos" value={`${currentOrders.length.toLocaleString("es-CO")} / ${goalOrders.toLocaleString("es-CO")}`} progress={orderGoal} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
          <div className="dashboard-card overflow-x-auto">
            <div className="flex items-center justify-between p-5 sm:p-6">
              <div><h2 className="dashboard-title">Pedidos recientes</h2><p className="mt-1 text-xs text-[#5f6978]">Últimas operaciones registradas</p></div>
              <Link href="/dashboard/orders" className="flex items-center gap-1 text-[10px] font-bold text-[#b6f23a]">Ver todos <ArrowUpRight size={13} /></Link>
            </div>
            <div className="min-w-[700px] px-5 pb-4 sm:px-6">
              <div className="grid grid-cols-[92px_1.1fr_1.1fr_100px_110px] border-b border-[#202936] py-3 text-[9px] font-bold uppercase text-[#5f6978]"><span>Pedido</span><span>Cliente</span><span>Producto</span><span>Total</span><span>Estado</span></div>
              {recentOrders.length ? recentOrders.map((order) => {
                const clientName = order.customerName || order.client.name || order.customerEmail || order.client.email || "Cliente";
                const productName = order.items[0]?.variant.product.name || "Sin detalle";
                return <div key={order.id} className="grid grid-cols-[92px_1.1fr_1.1fr_100px_110px] items-center border-b border-[#202936] py-3 last:border-0">
                  <span className="text-[10px] font-semibold text-[#8c97a8]">#{order.trackingCode.slice(-6)}</span>
                  <span className="flex items-center gap-2 truncate text-xs text-[#f5f7fa]"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#211d3d] text-[9px] font-bold text-[#8d78ff]">{initials(clientName)}</span>{clientName}</span>
                  <span className="truncate text-xs text-[#8c97a8]">{productName}</span>
                  <span className="text-xs font-semibold text-[#f5f7fa]">{money(Number(order.totalAmount))}</span>
                  <span className={`w-fit rounded-full px-2 py-1 text-[9px] font-bold ${statusStyle(order.status)}`}>{statusLabel(order.status)}</span>
                </div>;
              }) : <p className="py-10 text-center text-xs text-[#5f6978]">No hay pedidos en el periodo.</p>}
            </div>
          </div>

          <div className="dashboard-card p-5 sm:p-6">
            <div className="flex items-start justify-between"><div><h2 className="dashboard-title">Alertas de inventario</h2><p className="mt-1 text-xs text-[#5f6978]">Existencias que requieren atención</p></div><TriangleAlert size={18} className="text-[#ffb84a]" /></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[12px] border border-[#202936] bg-[#161d29] p-3"><p className="font-['Space_Grotesk'] text-2xl text-[#f5f7fa]">{lowStock.length}</p><p className="mt-1 text-[9px] uppercase text-[#5f6978]">Alertas activas</p></div>
              <div className="rounded-[12px] border border-[#202936] bg-[#161d29] p-3"><p className="font-['Space_Grotesk'] text-2xl text-[#f5f7fa]">{totalStock.toLocaleString("es-CO")}</p><p className="mt-1 text-[9px] uppercase text-[#5f6978]">Unidades totales</p></div>
            </div>
            <div className="mt-4 space-y-2">
              {lowStock.length ? lowStock.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-[10px] border border-[#202936] bg-[#0e121a] p-3"><span className="flex size-8 items-center justify-center rounded-lg bg-[#2b2113] text-[#ffb84a]"><TriangleAlert size={15} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#f5f7fa]">{item.product.name}</p><p className="mt-1 text-[9px] text-[#5f6978]">{item.sku || "Sin SKU"}</p></div><span className="text-right"><strong className="block text-sm text-[#f5f7fa]">{item.stock}</strong><small className="text-[8px] uppercase text-[#5f6978]">unid.</small></span></div>) : <p className="py-6 text-center text-xs text-[#5f6978]">Inventario estable.</p>}
            </div>
            <Link href="/dashboard/inventory" className="mt-4 flex h-[38px] items-center justify-center gap-2 rounded-[10px] border border-[#2c3747] bg-[#161d29] text-xs font-bold text-[#f5f7fa]"><PackagePlus size={15} />Gestionar inventario</Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-[#202936] pt-5 text-[10px] text-[#5f6978]">
          <span className="flex items-center gap-2"><Check size={12} className="text-[#b6f23a]" />Sincronización activa</span>
          <span>·</span>
          <span>{globalRole ? "Vista global" : "Vista de tienda asignada"}</span>
          <span>·</span>
          <span>{user.role}</span>
        </div>
      </main>
    </div>
  );
}

function Goal({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[10px]"><span className="font-semibold text-[#8c97a8]">{label}</span><span className="text-[#f5f7fa]">{value}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#202936]"><div className="h-full rounded-full bg-[#b6f23a]" style={{ width: `${progress}%` }} /></div>
    </div>
  );
}
