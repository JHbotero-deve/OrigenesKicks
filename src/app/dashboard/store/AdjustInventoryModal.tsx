'use client';
import { useState } from 'react';
import { adjustInventory } from '@/lib/actions/inventory';

export default function AdjustInventoryModal({ isOpen, onClose, storeId, userId }: { isOpen: boolean, onClose: () => void, storeId: string, userId: string }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    variantId: '',
    quantity: -1,
    reason: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await adjustInventory({
      variantId: formData.variantId,
      quantity: formData.quantity,
      reason: formData.reason,
      userId: userId,
      storeId: storeId,
    });

    if (result.success) {
      alert('Inventario actualizado correctamente');
      onClose();
    } else {
      alert('Error al actualizar inventario');
    }
    setLoading(false);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in'>
      <div className='bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'>
        <div className='bg-red-600 p-6 text-white'>
          <h3 className='text-2xl font-black uppercase italic'>Ajustar Inventario ⚠️</h3>
          <p className='text-sm opacity-90'>Registra daños, pérdidas o errores</p>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          <div>
            <label className='block text-sm font-bold text-gray-600 mb-1'>ID de la Variante/Zapato</label>
            <input 
              type='text' 
              required
              className='w-full p-4 rounded-xl border-2 border-gray-200 text-lg focus:border-red-500 outline-none'
              placeholder='Ej: UUID de la variante'
              onChange={(e) => setFormData({...formData, variantId: e.target.value})}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-bold text-gray-600 mb-1'>Cantidad</label>
              <input 
                type='number' 
                required
                className='w-full p-4 rounded-xl border-2 border-gray-200 text-lg focus:border-red-500 outline-none'
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
              />
            </div>
            <div className='flex items-end pb-1'>
              <p className='text-[10px] text-gray-400 font-bold uppercase italic'>-1 = Pérdida / +1 = Entrada</p>
            </div>
          </div>

          <div>
            <label className='block text-sm font-bold text-gray-600 mb-1'>Razón del Ajuste</label>
            <textarea 
              required
              className='w-full p-4 rounded-xl border-2 border-gray-200 text-lg focus:border-red-500 outline-none'
              placeholder='Ej: Suela rota, error de conteo...'
              rows={3}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <button 
              type='button' 
              onClick={onClose}
              className='flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors'
            >
              Cancelar
            </button>
            <button 
              type='submit' 
              disabled={loading}
              className='flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition-all shadow-lg active:scale-95 disabled:opacity-50'
            >
              {loading ? 'Guardando...' : 'CONFIRMAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
