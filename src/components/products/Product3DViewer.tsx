"use client";

import React from 'react';

interface Props {
  modelUrl: string;
  posterUrl?: string;
}

export const Product3DViewer: React.FC<Props> = ({ modelUrl, posterUrl }) => {
  return (
    <div className="w-full h-[400px] bg-gray-100 rounded-2xl overflow-hidden relative border-2 border-dashed border-gray-200 group">
      {/* Script de model-viewer (se carga una vez) */}
      <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>

      {/* @ts-ignore */}
      <model-viewer
        src={modelUrl}
        poster={posterUrl}
        alt="Kicks 3D Model"
        auto-rotate
        camera-controls
        ar
        shadow-intensity="1"
        style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6' }}
      >
        <div className="absolute bottom-4 left-4 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest italic animate-pulse">
          🕹️ Interactúa con tus Kicks
        </div>
      </model-viewer>
    </div>
  );
};
