import { getFinancialReport } from '@/lib/actions/finance';
import { format } from 'date-fns';

export default async function ReportsPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { summary, closings } = await getFinancialReport(firstDayOfMonth, lastDayOfMonth);

  const money = (value: unknown) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

  const differenceClass =
    Number(summary.difference ?? 0) === 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className='p-6 max-w-6xl mx-auto space-y-8'>
      <header className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-black text-gray-800'>Reportes Financieros</h1>
          <p className='text-gray-500'>Análisis de cierres de caja y rentabilidad</p>
        </div>
        <div className='bg-white p-2 rounded-lg border shadow-sm text-sm font-medium'>
          Mes: {format(now, 'MMMM yyyy')}
        </div>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-6 rounded-2xl border shadow-sm'>
          <p className='text-sm text-gray-500 font-semibold uppercase'>Ventas Totales</p>
          <p className='text-3xl font-black text-blue-600'>{money(summary.totalSales)}</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border shadow-sm'>
          <p className='text-sm text-gray-500 font-semibold uppercase'>Efectivo Total</p>
          <p className='text-3xl font-black text-green-600'>{money(summary.totalCash)}</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border shadow-sm'>
          <p className='text-sm text-gray-500 font-semibold uppercase'>Transferencias</p>
          <p className='text-3xl font-black text-purple-600'>{money(summary.totalTransfers)}</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border shadow-sm'>
          <p className='text-sm text-gray-500 font-semibold uppercase'>Dif. Caja (Error)</p>
          <p className={`text-3xl font-black ${differenceClass}`}>
            {money(summary.difference)}
          </p>
        </div>
      </div>

      <div className='bg-white rounded-2xl border shadow-sm overflow-hidden'>
        <div className='p-4 border-b bg-gray-50'>
          <h2 className='font-bold text-gray-700'>Detalle de Cierres Diarios</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 text-gray-400 text-xs uppercase font-bold'>
                <th className='p-4 border-b'>Fecha</th>
                <th className='p-4 border-b'>Ventas Sist.</th>
                <th className='p-4 border-b'>Efectivo</th>
                <th className='p-4 border-b'>Transf.</th>
                <th className='p-4 border-b'>Diferencia</th>
                <th className='p-4 border-b'>Observaciones</th>
              </tr>
            </thead>
            <tbody className='text-sm'>
              {closings.length === 0 ? (
                <tr>
                  <td colSpan={6} className='p-10 text-center text-gray-400'>
                    No hay cierres registrados este mes.
                  </td>
                </tr>
              ) : (
                closings.map((c) => (
                  <tr key={c.id} className='border-b hover:bg-gray-50 transition-colors'>
                    <td className='p-4 font-medium'>{format(new Date(c.date), 'dd MMM yyyy')}</td>
                    <td className='p-4 font-bold'>{money(c.totalSales)}</td>
                    <td className='p-4'>{money(c.totalCash)}</td>
                    <td className='p-4'>{money(c.totalTransfers)}</td>
                    <td className={`p-4 font-bold ${Number(c.difference ?? 0) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {money(c.difference)}
                    </td>
                    <td className='p-4 text-gray-500 italic'>{c.observations || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
