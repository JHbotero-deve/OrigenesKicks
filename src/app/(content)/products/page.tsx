import { ProductList } from "@/features/products/ProductList";
import { PromoBanner } from "@/features/products/PromoBanner";
import { SpecialOffersSection } from "@/features/products/SpecialOffersSection";
import { StoresShowcase } from "@/components/layout/StoresShowcase";
import { PublicityStand } from "@/components/layout/PublicityStand";
import prisma from "@/lib/db";
import { releaseExpiredReservations } from "@/lib/actions";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  // Tarea de mantenimiento en segundo plano
  await releaseExpiredReservations();

  const allProducts = await prisma.product.findMany({
    where: { active: true },
    include: { variants: {
      include: { store: true }
    } },
    orderBy: { salesCount: 'desc' },
  });

  const stores = await prisma.store.findMany({
    where: { active: true }
  });

  const specialProducts = allProducts.filter(p => p.isSpecial);
  const regularProducts = allProducts.filter(p => !p.isSpecial);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Impacto Inicial */}
      <PromoBanner />

      {/* 2. La Vitrina (Lo que el cliente vino a buscar) */}
      <div className="px-4 max-w-[1600px] mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Vitrina Principal de Kicks</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em]">Horma Nacional • Calidad de Exportación • Reserva por 24h</p>
        </div>

        {regularProducts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 font-black uppercase italic tracking-widest text-sm">Surtiendo la bodega... ¡Vuelve pronto!</p>
          </div>
        ) : (
          <ProductList products={regularProducts as any} />
        )}
      </div>

      {/* 3. Oportunidades Flash (Para gente de la casa) */}
      <div className="px-4 max-w-[1600px] mx-auto">
        <SpecialOffersSection specialProducts={specialProducts as any} />
      </div>

      {/* 4. Respaldo de Marca (Publicidad de Fábrica) */}
      <PublicityStand />

      {/* 5. Nuestras Sedes (Presencia Real) */}
      <StoresShowcase stores={stores as any} />

      {/* Mensaje de Cierre */}
      <div className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[1em] text-gray-400">Orígenes Kicks 2026</p>
      </div>
    </div>
  );
}
