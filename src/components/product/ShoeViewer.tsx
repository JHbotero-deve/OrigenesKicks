'use client'

import React from 'react'

interface ShoeViewerProps {
  url: string;
  alt?: string;
  environment?: 'neutral' | 'studio' | 'city' | 'forest';
}

export function ShoeViewer({ url, alt = 'Modelo 3D de calzado', environment = 'neutral' }: ShoeViewerProps) {
  return (
    <div className="relative w-full h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-100 via-white to-gray-200 rounded-3xl overflow-hidden border border-gray-200 group shadow-inner">
      <model-viewer
        src={url}
        alt={alt}
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="2"
        shadow-softness="0.5"
        environment-image={environment}
        exposure="1.2"
        loading="lazy"
        touch-action="pan-y"
        camera-orbit="45deg 75deg 105%"
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Indicador de carga */}
        <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 uppercase">Cargando Modelo 3D...</p>
          </div>
        </div>

        {/* Tip de interacción */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white pointer-events-none border border-white/20 shadow-xl animate-bounce">
          🔄 Gira, Zoom y Arrastra 360°
        </div>

        {/* Botón de AR */}
        <button slot="ar-button" className="absolute bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <span>👁️ Ver en mi espacio (AR)</span>
        </button>
      </model-viewer>
      
      <div className="absolute top-6 left-6 pointer-events-none">
        <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
          ESTUDIO VIRTUAL PRO
        </span>
      </div>
    </div>
  )
}
