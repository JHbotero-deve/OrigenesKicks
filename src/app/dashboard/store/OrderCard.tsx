'use client';

import { useState } from 'react';

type OrderStatus =
  | 'RECIBIDO'
  | 'CONFIRMADO'
  | 'PROCESANDO'
  | 'DESPACHADO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'RECHAZADO';

type Order = {
  id: string;
  status: OrderStatus;
  client: {
    name: string;
    phone?: string | null;
  };
};

const statusColors: Record<OrderStatus, string> = {
  RECIBIDO: 'bg-red-100 text-red-700 border-red-200',
  CONFIRMADO: 'bg-green-100 text-green-700 border-green-200',
  PROCESANDO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  DESPACHADO: 'bg-blue-100 text-blue-700 border-blue-200',
  ENTREGADO: 'bg-gray-100 text-gray-700 border-gray-200',
  CANCELADO: 'bg-gray-100 text-gray-700 border-gray-200',
  RECHAZADO: 'bg-gray-100 text-gray-700 border-gray-200',
};

const nextStatus: Partial<Record<OrderStatus, { value: OrderStatus; label: string }>> = {
  RECIBIDO: { value: 'CONFIRMADO', label: 'PAGO RECIBIDO' },
  CONFIRMADO: { value: 'PROCESANDO', label: 'PREPARANDO' },
  PROCESANDO: { value: 'DESPACHADO', label: 'ENVIADO' },
  DESPACHADO: { value: 'ENTREGADO', label: 'ENTREGADO' },
};

export default function OrderCard({ order }: { order: Order }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStatusChange = async (status: OrderStatus) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, status }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'No se pudo actualizar el pedido');
        return;
      }

      if (result.whatsappLink) {
        window.open(result.whatsappLink, '_blank', 'noopener,noreferrer');
      }

      window.location.reload();
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const action = nextStatus[order.status];

  return (
    <div className='flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between'>
      <div className='flex w-full items-center gap-4 md:w-auto'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-800'>
          OK
        </div>

        <div className='min-w-0'>
          <p className='truncate text-lg font-bold text-gray-900'>{order.client.name}</p>
          <p className='text-sm text-gray-500'>{order.client.phone || 'Sin teléfono'}</p>
          <span className={`mt-1 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
            {order.status}
          </span>
          {error && (
            <p className='mt-2 text-sm font-medium text-red-600' role='alert'>
              {error}
            </p>
          )}
        </div>
      </div>

      {action && (
        <button
          type='button'
          onClick={() => handleStatusChange(action.value)}
          disabled={loading}
          className='min-h-11 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto'
        >
          {loading ? 'Procesando...' : action.label}
        </button>
      )}
    </div>
  );
}
