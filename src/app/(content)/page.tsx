import Link from "next/link";
import { ArrowRight, Box } from "lucide-react";
import { PublicityStand } from "@/components/layout/PublicityStand";

export default async function HomePage() {
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden bg-black text-white">
        <div className="pointer-events-none absolute inset-0 select-none text-[160px] font-black italic opacity-10 sm:text-[220px]">ORIGEN</div>
        <div className="relative z-10 mx-auto max-w-[1400px] px-5 py-16 sm:px-6 sm:py-24 md:py-32">
          <span className="mb-5 inline-block rounded-full bg-orange-600 px-4 py-1 text-[10px] font-black uppercase italic tracking-widest">Medellín · Skate & Streetwear</span>
          <h1 className="mb-6 max-w-3xl text-5xl font-black uppercase italic leading-[0.9] tracking-tighter sm:text-6xl md:text-7xl">Cada par cuenta<br/><span className="text-orange-500">una historia.</span></h1>
          <p className="mb-8 max-w-xl text-base font-bold leading-relaxed text-gray-300 sm:text-lg">Zapatillas hechas en el barrio, pensadas para tu calle. Explora la colección y revisa los modelos 3D disponibles antes de decidir.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-7 py-4 text-sm font-black uppercase italic text-white shadow-xl hover:bg-orange-500"><span>Ver catálogo</span><ArrowRight size={18}/></Link>
            <Link href="/products/3d-demo" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-7 py-4 text-sm font-black uppercase italic hover:border-white"><Box size={18}/> Ver demostración 3D</Link>
          </div>
        </div>
      </section>

      <PublicityStand />

      <section className="mx-auto max-w-[1400px] px-5 py-12 text-center sm:px-6 sm:py-16">
        <h2 className="mb-5 text-3xl font-black uppercase italic tracking-tighter sm:text-4xl">¿Listo para ver la colección?</h2>
        <Link href="/products" className="inline-flex items-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-black uppercase italic text-white shadow-xl hover:bg-gray-800">Ir al catálogo <ArrowRight size={18}/></Link>
      </section>
    </div>
  );
}
