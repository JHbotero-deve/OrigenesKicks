export default function ContentLoading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600" aria-hidden="true" />
      <p className="text-[10px] font-black uppercase italic tracking-widest text-gray-400">Cargando...</p>
    </div>
  );
}
