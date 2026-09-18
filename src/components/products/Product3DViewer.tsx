"use client";

import React from 'react';

interface Props {
  modelUrl: string;
  posterUrl?: string;
}

export const Product3DViewer: React.FC<Props> = ({ modelUrl, posterUrl }) => {
  return (
    <div className="w-full h-[600px] lg:h-[700px] bg-white rounded-3xl overflow-hidden relative group transition-all duration-500 shadow-inner">
      {/* 
          El script se carga globalmente en layout.tsx para evitar bloqueos.
          Usamos el elemento personalizado <model-viewer> directamente.
      */}
      {/* @ts-ignore */}
      <model-viewer
        src={modelUrl}
        poster={posterUrl}
        alt="Visor 3D de Calzado"
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
        className="transition-opacity duration-700"
      >
        {/* Indicador minimalista de interacción */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-black text-[11px] px-4 py-2 rounded-full font-bold uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-100 italic">
          🕹️ Gira y explora tus Kicks
        </div>

        {/* Slot de carga para mejorar la percepción de velocidad */}
        <div slot="poster" className="w-full h-full flex items-center justify-center bg-gray-50">
           <div className="animate-pulse text-gray-400 text-xs font-medium uppercase tracking-tighter">Cargando modelo 3D...</div>
        </div>
      </model-viewer>
    </div>
  );
};
