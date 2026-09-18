import { getTodaysOrders } from '@/lib/actions/orders';
import { calculateDailyTotals } from '@/lib/actions/finance';
import OrderCard from './OrderCard';
import ClosingSection from './ClosingSection';
import StoreControls from './StoreControls';

export default async function StorePage() {
  const orders = await getTodaysOrders();
  const totals = await calculateDailyTotals('default_store'); // Simplified for now

  return (
    <div className='p-4 max-w-4xl mx-auto space-y-6'>
      <header className='flex justify-between items-center bg-blue-600 text-white p-6 rounded-2xl shadow-lg'>
        <div>
          <h1 className='text-3xl font-bold'>Modo Tienda 👟</h1>
          <p className='opacity-90'>Gestiona tus ventas rápidas</p>
        </div>
        <div className='text-right'>
          <p className='text-sm uppercase font-semibold opacity-80'>Ventas Hoy</p>
          <p className='text-4xl font-black'>\</p>
        </div>
      </header>

      <StoreControls />

      <div className='grid gap-4'>
        <h2 className='text-xl font-bold text-gray-700 px-2'>Pedidos de Hoy</h2>
        {orders.length === 0 ? (
          <div className='text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed'>
            No hay pedidos hoy. ¡A vender!
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>

      <ClosingSection totals={totals} />
    </div>
  );
}
