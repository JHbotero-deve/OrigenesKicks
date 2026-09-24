"use client";

import React, { useState } from "react";
import { PublicImage } from "@/components/ui/PublicImage";

interface Props {
  modelUrl?: string | null;
  posterUrl?: string;
  productName?: string;
  className?: string;
}

export const Product3DViewer: React.FC<Props> = ({
  modelUrl,
  posterUrl,
  productName,
  className = "",
}) => {
  const [failed, setFailed] = useState(false);

  if (!modelUrl) {
    return (
      <div className={`flex min-h-[320px] w-full items-center justify-center rounded-3xl bg-[#f7f7f7] p-8 ${className}`}>
        <div className="max-w-sm text-center">
          <p className="text-sm font-black uppercase tracking-widest text-gray-900">
            Modelo 3D no disponible
          </p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-gray-500">
            Este producto todavía no tiene un modelo 3D real asociado.
          </p>
          {posterUrl && (
            <PublicImage src={posterUrl} alt={productName || "Producto"} width={160} height={160} className="mx-auto mt-5 h-40 w-40 object-contain" sizes="160px" />
          )}
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className={`relative flex min-h-[320px] w-full items-center justify-center overflow-hidden rounded-3xl bg-[#f7f7f7] p-8 ${className}`}>
        {posterUrl && (
          <PublicImage src={posterUrl} alt={productName || "Producto"} width={1000} height={520} className="h-full max-h-[520px] w-full object-contain" sizes="(max-width: 768px) 100vw, 1000px" />
        )}
        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-3 text-center shadow-lg backdrop-blur">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-700">
            No se pudo cargar el modelo 3D
          </p>
          <p className="mt-1 text-[9px] font-medium text-gray-500">
            Se muestra la fotografía del producto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-[min(78vw,620px)] min-h-[320px] w-full overflow-hidden rounded-3xl bg-white ${className}`}>
      <model-viewer
        src={modelUrl}
        poster={posterUrl || undefined}
        alt={`Modelo 3D de ${productName || "calzado"}`}
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1.5"
        shadow-softness="1"
        exposure="1"
        camera-orbit="0deg 75deg 2.6m"
        touch-action="pan-y"
        onError={() => setFailed(true)}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
        Orígenes Kicks · 3D
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-center text-[9px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur sm:text-[10px]">
        Arrastra para girar · pellizca para zoom
      </div>
    </div>
  );
};
