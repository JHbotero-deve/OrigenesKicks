'use client'

import React from 'react'

interface ShoeViewerProps {
  url: string;
  alt?: string;
}

export function ShoeViewer({ url, alt = 'Modelo 3D de calzado' }: ShoeViewerProps) {
  return (
    <div className="relative w-full h-[400px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 group">
      <model-viewer
        src={url}
        alt={alt}
        auto-rotate
        camera-controls
        shadow-intensity="1"
        environment-image="neutral"
        exposure="1"
        loading="lazy"
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-600 pointer-events-none border border-gray-200 shadow-sm">
          Gira el zapato 360°
        </div>
      </model-viewer>
      
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
          Vista 3D Interactiva
        </span>
      </div>
    </div>
  )
}
