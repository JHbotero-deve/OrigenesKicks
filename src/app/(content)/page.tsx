import Link from "next/link";
import { ArrowRight, Box } from "lucide-react";
import { PublicityStand } from "@/components/layout/PublicityStand";
import { StoresShowcase } from "@/components/layout/StoresShowcase";

export default async function HomePage() {
  const featured: never[] = [];
  const stores: never[] = [];

  return (
    <div className="space-y-4 -mx-4 -my-8">
      {/* HERO */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-[220px] font-black italic -rotate-6 -translate-x-10 -translate-y-10 select-none pointer-events-none">
          ORIGEN
        </div>
        <div className="max-w-[1400px] mx-auto px-6 py-24 md:py-32 relative z-10">
          <span className="bg-orange-600 text-white px-4 py-1 rounded-full text-[11px] font-black uppercase italic tracking-widest mb-6 inline-block">
            Medellín • Skate & Streetwear
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-[0.95] tracking-tighter mb-6 max-w-3xl">
            Cada par cuenta<br /><span className="text-orange-500">una historia.</span>
          </h1>
          <p className="text-gray-300 font-bold max-w-xl mb-10 text-lg">
            Zapatillas hechas en el barrio, pensadas para tu calle. Explorá la colección
            y girá cada modelo en 3D antes de decidir.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="bg-orange-600 hover:bg-orange-500 transition-colors text-white px-8 py-4 rounded-2xl font-black uppercase italic flex items-center gap-2 shadow-xl"
            >
              Ver el catálogo <ArrowRight size={18} />
            </Link>
            <Link
              href="/products"
              className="border-2 border-white/30 hover:border-white transition-colors px-8 py-4 rounded-2xl font-black uppercase italic flex items-center gap-2"
            >
              <Box size={18} /> Explorar en 3D
            </Link>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      {featured.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="mb-10">
            <span className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase italic tracking-[0.2em] mb-4 inline-block">
              Lo más pedido
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">
              Empezá por acá
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <Box className="text-gray-300" size={48} />
                  )}
                </div>
                <div className="p-5">
                  <p className="font-black uppercase italic text-sm">{p.name}</p>
                  <p className="text-orange-600 font-black mt-1">${Number(p.basePrice).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <PublicityStand />
      {stores.length > 0 && <StoresShowcase stores={stores} />}

      {/* CTA FINAL */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-6">
          ¿Listo para ver la colección completa?
        </h2>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 transition-colors text-white px-10 py-5 rounded-2xl font-black uppercase italic shadow-xl"
        >
          Ir al catálogo <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
