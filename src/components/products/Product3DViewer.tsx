"use client";

import React from 'react';

// Declaración global para que TypeScript reconozca el elemento personalizado de Google
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        poster?: string;
        alt?: string;
        'auto-rotate'?: boolean | string;
        'camera-controls'?: boolean | string;
        ar?: boolean | string;
        'shadow-intensity'?: string;
        'shadow-softness'?: string;
        'environment-image'?: string;
        exposure?: string;
      }, HTMLElement>;
    }
  }
}

interface Props {
  modelUrl?: string | null;
  posterUrl?: string;
  productName?: string;
}

export const Product3DViewer: React.FC<Props> = ({ modelUrl, posterUrl, productName }) => {
  // Si el producto no tiene modelo 3D, mostramos la imagen estática como fondo/fallback elegante
  if (!modelUrl) {
    return (
      <div className="w-full h-[600px] lg:h-[700px] bg-white rounded-3xl overflow-hidden relative shadow-inner flex items-center justify-center">
        <img
          src={posterUrl}
          alt={productName || "Calzado"}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-[11px] px-4 py-2 rounded-full font-bold uppercase tracking-widest shadow-lg">
          Vista estática (modelo 3D no disponible)
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] lg:h-[700px] bg-white rounded-3xl overflow-hidden relative group transition-all duration-500 shadow-inner">
      <model-viewer
        src={modelUrl}
        poster={posterUrl || undefined}
        alt={`Visor 3D de ${productName || 'Calzado'}`}
        auto-rotate
        camera-controls
        ar
        shadow-intensity="2"
        shadow-softness="1"
        environment-image="neutral"
        exposure="1"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          cursor: 'grab'
        }}
      >
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-black text-[11px] px-4 py-2 rounded-full font-bold uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-100 italic pointer-events-none">
          Gira y explora tus Kicks en 3D
        </div>

        <div slot="poster" className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="animate-pulse text-gray-400 text-xs font-medium uppercase tracking-tighter">Cargando modelo 3D interactivo...</div>
        </div>
      </model-viewer>
    </div>
  );
};