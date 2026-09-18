'use client';
import { useState } from 'react';
import { performDailyClosing } from '@/lib/actions/finance';

export default function ClosingSection({ totals }: { totals: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cashAmount: 0,
    transferAmount: 0,
    observations: '',
  });

  const handleClose = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await performDailyClosing({
      storeId: 'default_store', // Simplified
      userId: 'admin_user', // This should come from auth session
      ...formData
    });

    if (result.success) {
      alert('Cierre de caja realizado con éxito. Diferencia: \$' + result.difference);
      setIsOpen(false);
    } else {
      alert('Error al realizar el cierre');
    }
    setLoading(false);
  };

  return (
    <div className='mt-10 p-6 bg-gray-100 rounded-3xl border-2 border-gray-200'>
      {!isOpen ? (
        <div className='text-center'>
          <h3 className='text-lg font-bold text-gray-600 mb-4'>¿Terminaste la jornada?</h3>
          <button 
            onClick={() => setIsOpen(true)}
            className='bg-black text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95'
          >
            🔒 HACER CIERRE DE CAJA
          </button>
        </div>
      ) : (
        <form onSubmit={handleClose} className='space-y-4'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-black text-gray-800'>Cerrando Caja 💰</h3>
            <button type='button' onClick={() => setIsOpen(false)} className='text-gray-500 font-bold'>Cancelar</button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-bold text-gray-600 mb-1'>Efectivo en Caja</label>
              <input 
                type='number' 
                className='w-full p-4 rounded-xl border-2 border-gray-300 text-xl font-bold'
                required
                onChange={(e) => setFormData({...formData, cashAmount: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className='block text-sm font-bold text-gray-600 mb-1'>Transferencias / Nequi</label>
              <input 
                type='number' 
                className='w-full p-4 rounded-xl border-2 border-gray-300 text-xl font-bold'
                required
                onChange={(e) => setFormData({...formData, transferAmount: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-bold text-gray-600 mb-1'>Observaciones</label>
            <textarea 
              className='w-full p-4 rounded-xl border-2 border-gray-300'
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
            />
          </div>

          <div className='bg-white p-4 rounded-xl border-2 border-blue-200 text-center mb-4'>
            <p className='text-sm text-gray-500'>El sistema dice que deberías tener:</p>
            <p className='text-3xl font-black text-blue-600'>\</p>
          </div>

          <button 
            type='submit' 
            disabled={loading}
            className='w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95'
          >
            {loading ? 'Guardando...' : '✅ CONFIRMAR Y CERRAR DÍA'}
          </button>
        </form>
      )}
    </div>
  );
}
