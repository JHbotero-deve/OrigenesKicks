import { createClient } from "@/lib/supabase-server";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

const ACTIVE_ORDER_STATUSES = ["CONFIRMADO", "PROCESANDO", "DESPACHADO", "ENTREGADO"];

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const percent = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const monthLabel = (date: Date) =>
  new Intl.DateTimeFormat("es-CO", { month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();

const formatRelativeTime = (date: Date) => {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
};

type OrderRow = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  client_id: string;
  store_id: string | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("id,name,email,role,work_store_id")
    .eq("email", user.email)
    .maybeSingle();

  if (userError || !dbUser) return null;

  const isGlobalRole = dbUser.role === "OWNER" || dbUser.role === "ADMIN";
  const storeId = isGlobalRole ? null : dbUser.work_store_id;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfYearWindow = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const ordersQuery = supabase
    .from("pedidos")
    .select("id,status,totalAmount,createdAt,client_id,store_id")
    .gte("createdAt", startOfYearWindow.toISOString())
    .lt("createdAt", startOfNextMonth.toISOString());

  if (storeId) ordersQuery.eq("store_id", storeId);

  const variantsQuery = supabase
    .from("product_variants")
    .select("id,stock,product_id,store_id")
    .eq("active", true);

  if (storeId) variantsQuery.eq("store_id", storeId);

  const clientsQuery = supabase
    .from("users")
    .select("id,name,email,createdAt")
    .eq("role", "CLIENT")
    .gte("createdAt", startOfPreviousMonth.toISOString());

  const inventoryQuery = supabase
    .from("inventory_logs")
    .select("id,variant_id,quantity,reason,createdAt,store_id")
    .gte("createdAt", startOfToday.toISOString())
    .lt("createdAt", startOfTomorrow.toISOString())
    .order("createdAt", { ascending: false })
    .limit(5);

  if (storeId) inventoryQuery.eq("store_id", storeId);

  const [{ data: orders, error: ordersError }, { data: variants, error: variantsError }, { data: clients, error: clientsError }, { data: inventory, error: inventoryError }] =
    await Promise.all([ordersQuery, variantsQuery, clientsQuery, inventoryQuery]);

  if (ordersError || variantsError || clientsError || inventoryError) {
    console.error("Error cargando dashboard:", {
      ordersError,
      variantsError,
      clientsError,
      inventoryError,
    });
    return (
      <div className="rounded-[2.5rem] border border-red-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black uppercase italic text-gray-900">Dashboard no disponible</h1>
        <p className="mt-3 text-sm text-gray-500">
          No se pudieron cargar los datos operativos. La sesión está activa, pero la consulta de datos devolvió un error.
        </p>
      </div>
    );
  }

  const allOrders = (orders ?? []) as OrderRow[];
  const activeOrders = allOrders.filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status));
  const currentMonthSales = activeOrders
    .filter((order) => {
      const date = new Date(order.createdAt);
      return date >= startOfMonth && date < startOfNextMonth;
    })
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const previousMonthSales = activeOrders
    .filter((order) => {
      const date = new Date(order.createdAt);
      return date >= startOfPreviousMonth && date < startOfMonth;
    })
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const todayOrders = activeOrders.filter((order) => {
    const date = new Date(order.createdAt);
    return date >= startOfToday && date < startOfTomorrow;
  }).length;

  const totalStock = (variants ?? []).reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
  const newClients = (clients ?? []).filter((client) => new Date(client.createdAt) >= startOfMonth).length;
  const previousNewClients = (clients ?? []).filter((client) => {
    const date = new Date(client.createdAt);
    return date >= startOfPreviousMonth && date < startOfMonth;
  }).length;

  const clientIds = [...new Set(allOrders.map((order) => order.client_id))];
  const variantIds = [...new Set((inventory ?? []).map((log) => log.variant_id))];

  const [{ data: orderClients }, { data: inventoryVariants }] = await Promise.all([
    clientIds.length
      ? supabase.from("users").select("id,name").in("id", clientIds)
      : Promise.resolve({ data: [] }),
    variantIds.length
      ? supabase.from("product_variants").select("id,product_id").in("id", variantIds)
      : Promise.resolve({ data: [] }),
  ]);

  const productIds = [...new Set((inventoryVariants ?? []).map((variant) => variant.product_id))];
  const { data: inventoryProducts } = productIds.length
    ? await supabase.from("products").select("id,name").in("id", productIds)
    : { data: [] };

  const clientMap = new Map((orderClients ?? []).map((client) => [client.id, client.name || client.email || "Cliente"]));
  const productMap = new Map((inventoryProducts ?? []).map((product) => [product.id, product.name]));

  const recentOrders = allOrders
    .filter((order) => {
      const date = new Date(order.createdAt);
      return date >= startOfToday && date < startOfTomorrow;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const variantProductMap = new Map((inventoryVariants ?? []).map((variant) => [variant.id, productMap.get(variant.product_id) || "Producto"]));

  const monthStarts = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return { date, start: date, end: new Date(date.getFullYear(), date.getMonth() + 1, 1) };
  });

  const chartValues = monthStarts.map(({ start, end }) =>
    activeOrders
      .filter((order) => {
        const date = new Date(order.createdAt);
        return date >= start && date < end;
      })
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
  );
  const maxChartValue = Math.max(...chartValues, 1);

  const activities = [
    ...recentOrders.map((order) => ({
      id: `order-${order.id}`,
      type: "PEDIDO",
      message: `${clientMap.get(order.client_id) || "Cliente"} · ${money(Number(order.totalAmount || 0))}`,
      time: new Date(order.createdAt),
      icon: order.status === "ENTREGADO" ? CheckCircle2 : Clock,
      tone: order.status === "ENTREGADO" ? "text-green-400" : "text-orange-400",
    })),
    ...(inventory ?? []).map((log) => ({
      id: `inventory-${log.id}`,
      type: "INVENTARIO",
      message: `${variantProductMap.get(log.variant_id) || "Producto"} · ${Number(log.quantity) > 0 ? "+" : ""}${log.quantity} unidades`,
      time: new Date(log.createdAt),
      icon: Number(log.quantity) < 0 ? AlertCircle : Package,
      tone: Number(log.quantity) < 0 ? "text-red-400" : "text-blue-400",
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 6);

  const stats = [
    { label: "Ventas del mes", value: money(currentMonthSales), change: `${percent(currentMonthSales, previousMonthSales) >= 0 ? "+" : ""}${percent(currentMonthSales, previousMonthSales)}%`, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Pedidos hoy", value: String(todayOrders), change: "Hoy", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Stock disponible", value: totalStock.toLocaleString("es-CO"), change: "Unidades", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Clientes nuevos", value: String(newClients), change: `${percent(newClients, previousNewClients) >= 0 ? "+" : ""}${percent(newClients, previousNewClients)}%`, icon: Users, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border-4 border-orange-500 bg-black text-3xl font-black italic text-white shadow-2xl">
            {dbUser.name?.[0]?.toUpperCase() ?? dbUser.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">
              Resumen <span className="text-orange-600">Operativo</span>
            </h1>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {dbUser.name} · {dbUser.role}{storeId ? " · Tienda asignada" : " · Todas las tiendas"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between">
              <div className={`${stat.bg} ${stat.color} rounded-2xl p-3`}><stat.icon size={20} /></div>
              <span className={`${stat.bg} ${stat.color} rounded-full px-2 py-0.5 text-[10px] font-black`}>{stat.change}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
            <p className="mt-1 text-2xl font-black italic">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[3rem] border border-gray-100 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Ventas mensuales</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Datos registrados en pedidos</p>
            </div>
            <span className="text-[9px] font-bold uppercase text-gray-400">Últimos 12 meses</span>
          </div>
          <div className="flex h-64 items-end justify-between gap-2 px-2">
            {chartValues.map((value, index) => (
              <div key={monthStarts[index].start.toISOString()} className="group flex h-full flex-1 flex-col justify-end">
                <div className="relative w-full rounded-t-xl bg-gray-100 transition-all group-hover:bg-orange-500" style={{ height: `${Math.max((value / maxChartValue) * 100, value > 0 ? 4 : 1)}%` }} title={money(value)}>
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[8px] font-black text-white opacity-0 transition-opacity group-hover:opacity-100">{money(value)}</span>
                </div>
                <p className="mt-4 text-center text-[8px] font-black text-gray-300">{monthLabel(monthStarts[index].date)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[3rem] bg-black p-8 text-white shadow-2xl">
          <h2 className="relative z-10 mb-8 text-xl font-black uppercase italic tracking-tighter">Actividad reciente</h2>
          <div className="relative z-10 space-y-5">
            {activities.length === 0 ? (
              <div className="rounded-2xl border border-white/10 px-4 py-6 text-center text-xs text-white/50">No hay actividad registrada hoy.</div>
            ) : (
              activities.map((activity) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-0">
                    <div className={`mt-1 ${activity.tone}`}><ActivityIcon size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className={`rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-black ${activity.tone}`}>{activity.type}</span>
                        <span className="text-[8px] font-bold uppercase text-white/30">{formatRelativeTime(activity.time)}</span>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-tight text-white/80">{activity.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <a href="/dashboard/logs" className="mt-8 flex items-center justify-center text-[9px] font-black uppercase italic tracking-[0.3em] text-white/40 transition-colors hover:text-orange-500">
            Ver actividad completa <ArrowUpRight size={10} className="ml-1" />
          </a>
        </div>
      </div>

      <div className="rounded-[3rem] border border-gray-100 bg-white p-8">
        <h2 className="mb-8 px-4 text-xl font-black uppercase italic tracking-tighter">Accesos directos</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { name: "Pedidos", href: "/dashboard/orders", icon: ShoppingCart },
            { name: "Bodega", href: "/dashboard/inventory", icon: Package },
            { name: "Reportes", href: "/dashboard/reports", icon: FileText },
            { name: "Equipo", href: "/dashboard/admin/users", icon: Users },
          ].map((item) => (
            <a key={item.name} href={item.href} className="group rounded-[2rem] border border-transparent bg-gray-50 p-6 transition-all hover:border-black hover:bg-white">
              <item.icon className="mb-4 text-gray-400 transition-colors group-hover:text-orange-600" size={24} />
              <p className="text-xs font-black uppercase italic tracking-tighter">{item.name}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
