'use client';

import { useState } from 'react';
import { performDailyClosing } from '@/lib/actions/finance';

type Role = 'OWNER' | 'ADMIN' | 'SELLER' | 'DELIVERY' | 'CLIENT';

export default function ClosingSection({
  totals,
  storeId,
  role,
}: {
  totals: { totalSales: unknown; totalOrders: number };
  storeId: string | null;
  role: Role | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ cashAmount: '', transferAmount: '', observations: '' });

  const expected = Number(totals.totalSales ?? 0);
  const canClose = role === 'OWNER' || role === 'ADMIN';

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await performDailyClosing({
        storeId: storeId ?? '',
        cashAmount: Number(formData.cashAmount),
        transferAmount: Number(formData.transferAmount),
        observations: formData.observations,
      });

      if (result.success) {
        setIsOpen(false);
        setFormData({ cashAmount: '', transferAmount: '', observations: '' });
        const difference = Number(result.difference ?? 0);
        alert(`Cierre de caja realizado. Diferencia: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(difference)}`);
      } else {
        alert(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'>
      {!isOpen ? (
        canClose ? <div className='text-center'>
          <h3 className='mb-4 text-lg font-bold text-gray-900'>¿Terminaste la jornada?</h3>
          <button
            type='button'
            onClick={() => setIsOpen(true)}
            disabled={!storeId}
            className='rounded-xl bg-gray-950 px-8 py-4 font-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Hacer cierre de caja
          </button>
        </div> : null
      ) : (
        <form onSubmit={handleClose} className='space-y-4'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-xl font-black text-gray-900'>Cierre de caja</h3>
            <button type='button' onClick={() => setIsOpen(false)} className='font-bold text-gray-500 hover:text-gray-900'>
              Cancelar
            </button>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {[
              ['cashAmount', 'Efectivo en caja'],
              ['transferAmount', 'Transferencias / pagos digitales'],
            ].map(([field, label]) => (
              <div key={field}>
                <label htmlFor={field} className='mb-1 block text-sm font-bold text-gray-700'>{label}</label>
                <input
                  id={field}
                  type='number'
                  min='0'
                  step='1'
                  required
                  value={formData[field as 'cashAmount' | 'transferAmount']}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  className='w-full rounded-xl border border-gray-300 p-4 text-xl font-bold outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10'
                />
              </div>
            ))}
          </div>

          <div>
            <label htmlFor='closing-observations' className='mb-1 block text-sm font-bold text-gray-700'>Observaciones</label>
            <textarea
              id='closing-observations'
              rows={3}
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className='w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10'
            />
          </div>

          <div className='rounded-xl border border-gray-200 bg-gray-50 p-4 text-center'>
            <p className='text-sm text-gray-500'>Ventas registradas por el sistema</p>
            <p className='mt-1 text-3xl font-black text-gray-950'>
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(expected)}
            </p>
          </div>

          <button
            type='submit'
            disabled={loading || !storeId}
            className='w-full rounded-xl bg-gray-950 py-4 text-lg font-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {loading ? 'Guardando...' : 'Confirmar y cerrar día'}
          </button>
        </form>
      )}
    </section>
  );
}
