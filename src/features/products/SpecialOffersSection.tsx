"use client";

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { ProductList } from './ProductList';
import { Button } from '@/components/ui/Button';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface SpecialOffersSectionProps {
  specialProducts: Product[];
}

export const SpecialOffersSection: React.FC<SpecialOffersSectionProps> = ({ specialProducts }) => {
  const [showOffers, setShowOffers] = useState(false);

  if (specialProducts.length === 0) return null;

  return (
    <div className="mb-12 border-b pb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-600 animate-pulse" />
          <h2 className="text-xl font-black italic uppercase">Zona de Descuentos Flash</h2>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOffers(!showOffers)}
          className="text-[10px] uppercase font-bold tracking-widest"
        >
          {showOffers ? (
            <span className="flex items-center">Ocultar Ofertas <ChevronUp className="ml-1 w-3 h-3" /></span>
          ) : (
            <span className="flex items-center">Abrir Precios Especiales <ChevronDown className="ml-1 w-3 h-3" /></span>
          )}
        </Button>
      </div>

      {showOffers ? (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-600 text-red-800 text-xs font-bold uppercase tracking-widest">
            🔥 Ofertas por tiempo limitado - Los precios vuelven a la normalidad al agotarse el stock
          </div>
          <ProductList products={specialProducts} />
        </div>
      ) : (
        <div className="bg-gray-100 p-8 rounded-xl text-center cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowOffers(true)}>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-[0.2em]">Haz clic para revelar precios exclusivos para clientes VIP</p>
        </div>
      )}
    </div>
  );
};
