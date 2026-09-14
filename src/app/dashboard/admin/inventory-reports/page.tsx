import { getInventoryLossReport } from '@/lib/actions/finance';
import { format } from 'date-fns';

export default async function InventoryReportsPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const { summary, details } = await getInventoryLossReport(firstDayOfMonth, lastDayOfMonth);

  return (
    <div className='p-6 max-w-6xl mx-auto space-y-8'>
      <header className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-black text-gray-800'>Control de Pérdidas e Inventario ⚠️</h1>
          <p className='text-gray-500'>Movimientos de stock que NO son ventas (Daños, Robos, Ajustes)</p>
        </div>
        <div className='bg-white p-2 rounded-lg border shadow-sm text-sm font-medium'>
          Mes: {format(now, 'MMMM yyyy')}
        </div>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-white p-6 rounded-2xl border shadow-sm border-l-8 border-l-red-500'>
          <p className='text-sm text-gray-500 font-semibold uppercase'>Impacto Económico Total</p>
          <p className='text-4xl font-black text-red-600'>\</p>
        </div>
        <div className='bg-white p-6 rounded-2xl border shadow-sm border-l-8 border-l-orange-500'>
          <p className='text-sm text-gray-500 font-semibold uppercase'>Total Unidades Ajustadas</p>
          <p className='text-4xl font-black text-orange-600'>{summary.totalUnitsMoved} und.</p>
        </div>
      </div>

      <div className='bg-white rounded-2xl border shadow-sm overflow-hidden'>
        <div className='p-4 border-b bg-gray-50'>
          <h2 className='font-bold text-gray-700'>Historial de Movimientos No-Venta</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead className='bg-gray-50 text-gray-400 text-xs uppercase font-bold'>
              <tr>
                <th className='p-4 border-b'>Fecha</th>
                <th className='p-4 border-b'>Producto</th>
                <th className='p-4 border-b'>Cant.</th>
                <th className='p-4 border-b'>Tipo</th>
                <th className='p-4 border-b'>Razón / Observación</th>
                <th className='p-4 border-b'>Valor Impacto</th>
              </tr>
            </thead>
            <tbody className='text-sm'>
              {details.length === 0 ? (
                <tr>
                  <td colSpan={6} className='p-10 text-center text-gray-400'>No hay movimientos registrados este mes.</td>
                </tr>
              ) : (
                details.map((item, i) => (
                  <tr key={i} className='border-b hover:bg-gray-50 transition-colors'>
                    <td className='p-4 font-medium'>{format(new Date(item.date), 'dd MMM yyyy')}</td>
                    <td className='p-4 font-bold text-gray-800'>{item.product}</td>
                    <td className={\p-4 font-bold \\}>
                      {item.quantity}
                    </td>
                    <td className='p-4'>
                      <span className='px-2 py-1 rounded-md bg-gray-100 text-[10px] font-bold uppercase'>{item.type}</span>
                    </td>
                    <td className='p-4 text-gray-600 italic'>"{item.reason}"</td>
                    <td className='p-4 font-bold text-gray-800'>\</td>
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
