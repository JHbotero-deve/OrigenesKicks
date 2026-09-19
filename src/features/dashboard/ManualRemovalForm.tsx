"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { adjustInventory } from '@/lib/actions/inventory';
import { Trash2, AlertCircle } from 'lucide-react';

interface ManualRemovalFormProps {
  variantId: string;
  productName: string;
  size: string;
  currentStock: number;
  storeId?: string | null;
}

export const ManualRemovalForm: React.FC<ManualRemovalFormProps> = ({
  variantId,
  productName,
  size,
  currentStock,
  storeId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedReason = reason.trim();
    if (normalizedReason.length < 5) {
      alert('El motivo debe tener al menos 5 caracteres.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > currentStock) {
      alert('La cantidad indicada no es válida para el stock disponible.');
      return;
    }

    setIsSubmitting(true);

    const result = await adjustInventory({
      variantId,
      quantity: -quantity,
      reason: normalizedReason,
      storeId: storeId ?? undefined,
    });

    if (result.success) {
      alert(`Se retiraron ${quantity} pares y el movimiento quedó registrado en auditoría.`);
      setIsOpen(false);
      setReason('');
      setQuantity(1);
    } else {
      alert(`No se pudo realizar el retiro: ${result.error}`);
    }

    setIsSubmitting(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:bg-red-50 hover:text-red-700"
        onClick={() => setIsOpen(true)}
        disabled={currentStock <= 0}
      >
        <Trash2 className="mr-1 h-4 w-4" />
        Retirar
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-removal-title"
    >
      <div className="w-full max-w-md rounded-xl border-t-4 border-red-600 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <h3 id="manual-removal-title" className="text-lg font-black uppercase italic">
            Retirar mercancía manualmente
          </h3>
        </div>

        <p className="mb-6 text-xs text-gray-500">
          Vas a retirar stock de{' '}
          <strong className="uppercase text-black">
            {productName} (Talla {size})
          </strong>
          . El movimiento quedará registrado en el Kardex de auditoría.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="removal-quantity" className="mb-1 block text-[10px] font-bold uppercase">
              Cantidad
            </label>
            <input
              id="removal-quantity"
              type="number"
              min={1}
              max={currentStock}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="w-full rounded border p-2 font-bold"
              required
            />
          </div>

          <div>
            <label htmlFor="removal-reason" className="mb-1 block text-[10px] font-bold uppercase">
              Motivo del retiro
            </label>
            <textarea
              id="removal-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ej.: garantía, daño, devolución, ajuste físico de inventario."
              className="h-24 w-full resize-none rounded border p-2 text-sm"
              required
              minLength={5}
              maxLength={500}
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
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar retiro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
