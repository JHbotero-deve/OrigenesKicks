'use client';

import { useState } from 'react';
import AdjustInventoryModal from './AdjustInventoryModal';

type Role = 'OWNER' | 'ADMIN' | 'SELLER' | 'DELIVERY' | 'CLIENT';

export default function StoreControls({ storeId, role }: { storeId: string | null; role: Role | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canAdjust = role === 'OWNER' || role === 'ADMIN';

  if (!canAdjust) return null;

  return (
    <>
      <button
        type='button'
        onClick={() => setIsModalOpen(true)}
        disabled={!storeId}
        className='mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-orange-500 py-4 text-lg font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50'
      >
        Reportar pérdida / ajuste
      </button>

      <AdjustInventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        storeId={storeId}
      />
    </>
  );
}
