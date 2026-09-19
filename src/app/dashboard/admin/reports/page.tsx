import { getFinancialReport } from '@/lib/actions/finance';

const money = (value: unknown) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(date);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

export default async function ReportsPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const { summary, closings } = await getFinancialReport(firstDayOfMonth, lastDayOfMonth);

  const differenceClass = summary.totalDiff === 0 ? 'text-green-600' : 'text-red-600';

  return (
    <main className='mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-gray-500'>Administración</p>
          <h1 className='mt-2 text-3xl font-black tracking-tight text-gray-950'>Reportes financieros</h1>
          <p className='mt-2 text-sm text-gray-500'>Cierres de caja y comportamiento de ventas del período.</p>
        </div>
        <div className='w-fit rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold capitalize text-gray-700 shadow-sm'>
          {formatMonth(now)}
        </div>
      </header>

      <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>Ventas totales</p>
          <p className='mt-2 text-3xl font-black tracking-tight text-gray-950'>{money(summary.totalRevenue)}</p>
        </div>
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>Efectivo</p>
          <p className='mt-2 text-3xl font-black tracking-tight text-gray-950'>{money(summary.totalCash)}</p>
        </div>
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>Transferencias</p>
          <p className='mt-2 text-3xl font-black tracking-tight text-gray-950'>{money(summary.totalTransfers)}</p>
        </div>
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>Diferencia de caja</p>
          <p className={`mt-2 text-3xl font-black tracking-tight ${differenceClass}`}>{money(summary.totalDiff)}</p>
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm'>
        <div className='border-b border-gray-200 px-5 py-4'>
          <h2 className='font-bold text-gray-950'>Detalle de cierres diarios</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[760px] text-left'>
            <thead>
              <tr className='border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500'>
                <th className='px-5 py-4'>Fecha</th>
                <th className='px-5 py-4'>Ventas sistema</th>
                <th className='px-5 py-4'>Efectivo</th>
                <th className='px-5 py-4'>Transferencias</th>
                <th className='px-5 py-4'>Diferencia</th>
                <th className='px-5 py-4'>Observaciones</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100 text-sm'>
              {closings.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-5 py-12 text-center text-gray-500'>No hay cierres registrados este mes.</td>
                </tr>
              ) : (
                closings.map((closing) => {
                  const difference = Number(closing.cashAmount) + Number(closing.transferAmount) - Number(closing.totalSales);
                  return (
                    <tr key={closing.id} className='transition-colors hover:bg-gray-50'>
                      <td className='px-5 py-4 font-medium text-gray-900'>{formatDate(new Date(closing.date))}</td>
                      <td className='px-5 py-4 font-semibold'>{money(closing.totalSales)}</td>
                      <td className='px-5 py-4'>{money(closing.cashAmount)}</td>
                      <td className='px-5 py-4'>{money(closing.transferAmount)}</td>
                      <td className={`px-5 py-4 font-bold ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>{money(difference)}</td>
                      <td className='px-5 py-4 text-gray-500'>{closing.observations || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
