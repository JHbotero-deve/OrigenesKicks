'use client';

import { updateOrderStatus } from '@/lib/actions/orders';
import { useState } from 'react';

type Order = {
  id: string;
  status: string;
  client: {
    name: string;
    phone?: string | null;
  };
};

export default function OrderCard({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    try {
      const result = await updateOrderStatus(order.id, status);
      if (result.success && result.whatsappLink) {
        window.open(result.whatsappLink, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    RECIBIDO: 'bg-red-100 text-red-700 border-red-200',
    CONFIRMADO: 'bg-green-100 text-green-700 border-green-200',
    PROCESANDO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    DESPACHADO: 'bg-blue-100 text-blue-700 border-blue-200',
    ENTREGADO: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4'>
      <div className='flex items-center gap-4 w-full md:w-auto'>
        <div className='bg-gray-100 p-3 rounded-full text-sm font-bold'>OK</div>
        <div>
          <p className='font-bold text-lg text-gray-800'>{order.client.name}</p>
          <p className='text-sm text-gray-500'>{order.client.phone || 'Sin teléfono'}</p>
          <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className='flex gap-2 w-full md:w-auto'>
        {order.status === 'RECIBIDO' && (
          <button onClick={() => handleStatusChange('CONFIRMADO')} disabled={loading} className='flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm'>
            {loading ? 'Procesando...' : 'PAGO RECIBIDO'}
          </button>
        )}
        {order.status === 'CONFIRMADO' && (
          <button onClick={() => handleStatusChange('PROCESANDO')} disabled={loading} className='flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm'>
            {loading ? 'Procesando...' : 'PREPARANDO'}
          </button>
        )}
        {order.status === 'PROCESANDO' && (
          <button onClick={() => handleStatusChange('DESPACHADO')} disabled={loading} className='flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm'>
            {loading ? 'Procesando...' : 'ENVIADO'}
          </button>
        )}
        {order.status === 'DESPACHADO' && (
          <button onClick={() => handleStatusChange('ENTREGADO')} disabled={loading} className='flex-1 md:flex-none bg-gray-800 hover:bg-black text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm'>
            {loading ? 'Procesando...' : 'ENTREGADO'}
          </button>
        )}
      </div>
    </div>
  );
}
