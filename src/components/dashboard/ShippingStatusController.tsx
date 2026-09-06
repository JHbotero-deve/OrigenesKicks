"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { updateShippingStatus } from '@/lib/actions';
import { Truck, CheckCircle, XCircle, Package } from 'lucide-react';

interface Props {
  shippingId: string;
  currentStatus: string;
}

export const ShippingStatusController: React.FC<Props> = ({ shippingId, currentStatus }) => {
  const [loading, setLoading] = useState(false);

  const changeStatus = async (newStatus: any) => {
    setLoading(true);
    const res = await updateShippingStatus(shippingId, newStatus);
    setLoading(false);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || "Error actualizando envío");
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-200">
      <p className="w-full text-[9px] font-black text-gray-400 uppercase mb-1 tracking-widest">Actualizar Estado de Entrega</p>
      
      <Button 
        onClick={() => changeStatus('EN_RUTA')}
        disabled={loading || currentStatus === 'EN_RUTA'}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-black italic text-[9px] uppercase transition-all ${
          currentStatus === 'EN_RUTA' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
        }`}
      >
        <Truck size={12} /> En Ruta
      </Button>

      <Button 
        onClick={() => changeStatus('ENTREGADO')}
        disabled={loading || currentStatus === 'ENTREGADO'}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-black italic text-[9px] uppercase transition-all ${
          currentStatus === 'ENTREGADO' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'
        }`}
      >
        <CheckCircle size={12} /> Entregado
      </Button>

      <Button 
        onClick={() => changeStatus('FALLIDO')}
        disabled={loading || currentStatus === 'FALLIDO'}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-black italic text-[9px] uppercase transition-all ${
          currentStatus === 'FALLIDO' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
        }`}
      >
        <XCircle size={12} /> Fallido
      </Button>

      {currentStatus === 'PENDIENTE' && (
        <div className="w-full flex items-center gap-2 text-orange-600 mt-1">
          <Package size={10} />
          <span className="text-[8px] font-bold uppercase">Esperando despacho</span>
        </div>
      )}
    </div>
  );
};
