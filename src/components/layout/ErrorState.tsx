"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  digest?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Algo salió mal",
  description = "No pudimos cargar esta sección. Intenta de nuevo en unos segundos.",
  digest,
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-5 px-4 py-12 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
        <AlertTriangle size={26} aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">{title}</h2>
        <p className="text-sm leading-relaxed text-gray-500">{description}</p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-xs font-black uppercase italic text-white hover:bg-gray-800"
          >
            <RotateCcw size={15} aria-hidden="true" /> Reintentar
          </button>
        )}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase italic text-gray-800 hover:bg-orange-50"
        >
          <Home size={15} aria-hidden="true" /> Ir al inicio
        </Link>
      </div>
      {digest && <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Código: {digest}</p>}
    </section>
  );
}
