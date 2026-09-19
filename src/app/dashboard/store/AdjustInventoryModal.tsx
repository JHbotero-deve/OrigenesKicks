'use client';

import { useState } from 'react';
import { adjustInventory } from '@/lib/actions/inventory';

export default function AdjustInventoryModal({
  isOpen,
  onClose,
  storeId,
}: {
  isOpen: boolean;
  onClose: () => void;
  storeId: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ variantId: '', quantity: -1, reason: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adjustInventory({
        variantId: formData.variantId.trim(),
        quantity: formData.quantity,
        reason: formData.reason,
        storeId: storeId ?? undefined,
      });

      if (result.success) {
        onClose();
        setFormData({ variantId: '', quantity: -1, reason: '' });
        alert('Inventario actualizado correctamente');
      } else {
        alert(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl'>
        <div className='bg-gray-950 p-6 text-white'>
          <h3 className='text-2xl font-black uppercase'>Ajustar inventario</h3>
          <p className='mt-1 text-sm text-gray-300'>Registra daños, pérdidas o errores de conteo.</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4 p-6'>
          <div>
            <label htmlFor='variant-id' className='mb-1 block text-sm font-bold text-gray-700'>ID de la variante</label>
            <input
              id='variant-id'
              type='text'
              required
              value={formData.variantId}
              onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
              className='w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10'
              placeholder='UUID de la variante'
            />
          </div>

          <div>
            <label htmlFor='inventory-quantity' className='mb-1 block text-sm font-bold text-gray-700'>Cantidad</label>
            <input
              id='inventory-quantity'
              type='number'
              min='-100000'
              max='100000'
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className='w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10'
            />
            <p className='mt-1 text-xs text-gray-500'>Usa valores negativos para retiros y positivos para entradas.</p>
          </div>

          <div>
            <label htmlFor='inventory-reason' className='mb-1 block text-sm font-bold text-gray-700'>Razón del ajuste</label>
            <textarea
              id='inventory-reason'
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className='w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10'
              placeholder='Ej. Suela rota, error de conteo...'
            />
          </div>

          <div className='flex gap-3 pt-2'>
            <button type='button' onClick={onClose} className='flex-1 rounded-xl py-3 font-bold text-gray-600 hover:bg-gray-100'>
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading || !storeId}
              className='flex-1 rounded-xl bg-gray-950 py-3 font-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
