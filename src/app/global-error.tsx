'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="bg-[#07090d] text-[#f5f7fa] font-sans min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#121620] border border-red-900/40 rounded-3xl p-8 text-center shadow-2xl">
          <h2 className="text-xl font-black uppercase tracking-wider text-red-500 mb-3">
            Error Crítico del Sistema
          </h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            {error.message || "Ha ocurrido un error inesperado en la aplicación."}
          </p>
          <button
            onClick={() => reset()}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs tracking-widest py-3.5 rounded-2xl transition-all shadow-lg"
          >
            Reintentar / Recargar
          </button>
        </div>
      </body>
    </html>
  );
}
