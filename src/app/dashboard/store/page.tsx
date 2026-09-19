import { getTodaysOrders } from '@/lib/actions/orders';
import { calculateDailyTotals } from '@/lib/actions/finance';
import { getSessionUser } from '@/lib/auth-guard';
import OrderCard from './OrderCard';
import ClosingSection from './ClosingSection';
import StoreControls from './StoreControls';

export default async function StorePage() {
  const { dbUser } = await getSessionUser();
  const storeId = dbUser?.workStoreId ?? null;

  const [orders, totals] = await Promise.all([
    getTodaysOrders(storeId ?? undefined),
    calculateDailyTotals(storeId ?? undefined),
  ]);

  return (
    <div className='mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6'>
      <header className='flex flex-col justify-between gap-4 rounded-2xl bg-gray-950 p-6 text-white shadow-sm sm:flex-row sm:items-end'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-gray-400'>Operación</p>
          <h1 className='mt-2 text-3xl font-black'>Modo tienda</h1>
          <p className='mt-1 text-gray-300'>Gestiona pedidos, inventario y cierre de caja.</p>
        </div>
        <div className='sm:text-right'>
          <p className='text-sm font-semibold uppercase text-gray-400'>Ventas hoy</p>
          <p className='text-3xl font-black'>
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(totals.totalSales ?? 0))}
          </p>
        </div>
      </header>

      <StoreControls storeId={storeId} />

      <section className='space-y-4'>
        <h2 className='px-1 text-xl font-black text-gray-950'>Pedidos de hoy</h2>
        {orders.length === 0 ? (
          <div className='rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-500'>
            No hay pedidos registrados hoy.
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </section>

      <ClosingSection totals={totals} storeId={storeId} />
    </div>
  );
}
