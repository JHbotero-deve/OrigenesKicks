import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <p className="text-6xl font-black italic tracking-tighter text-orange-600">404</p>
      <h1 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-gray-500">El producto o la sección que buscas no existe o ya no está disponible.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/products" className="rounded-2xl bg-black px-5 py-3 text-xs font-black uppercase italic text-white hover:bg-gray-800">
          Ver vitrina
        </Link>
        <Link href="/" className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase italic text-gray-800 hover:bg-orange-50">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
