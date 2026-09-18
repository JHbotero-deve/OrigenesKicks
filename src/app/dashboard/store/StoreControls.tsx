'use client';
import { useState } from 'react';
import AdjustInventoryModal from './AdjustInventoryModal';

export default function StoreControls() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className='w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 mb-6'
      >
        <span className='text-2xl'>⚠️</span> REPORTAR PÉRDIDA / AJUSTE
      </button>

      <AdjustInventoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        storeId='default_store' // Simplified
        userId='admin_user' // Simplified
      />
    </>
  );
}
