"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { manualInventoryRemoval } from '@/lib/actions';
import { Trash2, AlertCircle } from 'lucide-react';

interface ManualRemovalFormProps {
  variantId: string;
  productName: string;
  size: string;
  currentStock: number;
}

export const ManualRemovalForm: React.FC<ManualRemovalFormProps> = ({
  variantId, productName, size, currentStock
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 5) {
      alert("Debes proporcionar un motivo descriptivo.");
      return;
    }

    setIsSubmitting(true);
    const res = await manualInventoryRemoval({
      variantId,
      quantity,
      reason
    });

    if (res.success) {
      alert(`Éxito: Se retiraron ${quantity} unidades. Se ha enviado una alerta de seguridad al administrador.`);
      setIsOpen(false);
      setReason('');
      setQuantity(1);
    } else {
      alert("Error: " + res.error);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => setIsOpen(true)}
        disabled={currentStock <= 0}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Retirar
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border-t-4 border-red-600 animate-in zoom-in-95">
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h3 className="font-black uppercase italic text-lg">Retiro Manual de Stock</h3>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Estás retirando stock de <strong className="text-black uppercase">{productName} (Talla {size})</strong> fuera del sistema de ventas.
          Esta acción es <span className="underline font-bold">irrevocable</span> y disparará una alerta de seguridad.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">Cantidad a retirar</label>
            <input
              type="number"
              min="1"
              max={currentStock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full p-2 border rounded font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1">Motivo / Justificación (Obligatorio)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Producto dañado en bodega / Error de conteo físico..."
              className="w-full p-2 border rounded text-sm h-24 resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Confirmar Retiro"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
