import Link from "next/link";

export default async function PaymentResultPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-12">
      <section className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Wompi</p>
        <h1 className="mt-2 text-2xl font-black uppercase italic">Proceso de pago recibido</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-gray-500">
          {params.id ? "El pago fue enviado a validación. El estado definitivo se confirma en nuestro servidor mediante el evento de Wompi." : "El proceso de pago terminó. Revisa el estado del pedido en tu cuenta."}
        </p>
        {params.id && <p className="mt-4 break-all rounded-xl bg-gray-50 p-3 text-xs font-mono text-gray-500">Transacción: {params.id}</p>}
        <Link href="/products" className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-xs font-black uppercase text-white hover:bg-orange-600">Volver a productos</Link>
      </section>
    </main>
  );
}
