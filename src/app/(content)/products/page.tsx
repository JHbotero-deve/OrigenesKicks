import { ProductList } from "@/features/products/ProductList";
import { PromoBanner } from "@/features/products/PromoBanner";
import { SpecialOffersSection } from "@/features/products/SpecialOffersSection";
import { StoresShowcase } from "@/components/layout/StoresShowcase";
import { PublicityStand } from "@/components/layout/PublicityStand";
import prisma from "@/lib/db";
import { releaseExpiredReservations } from "@/lib/actions";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  // Ejecutamos la limpieza de reservas expiradas al cargar la vitrina
  await releaseExpiredReservations();

  const allProducts = await prisma.product.findMany({
    where: { active: true },
    include: { variants: true },
    orderBy: { salesCount: 'desc' }, // Ordenar por los más vendidos
  });

  const stores = await prisma.store.findMany({
    where: { active: true }
  });

  const specialProducts = allProducts.filter(p => p.isSpecial);
  const regularProducts = allProducts.filter(p => !p.isSpecial);

  return (
    <div className="space-y-12 pb-20">
      <PromoBanner />

      <PublicityStand />

      <SpecialOffersSection specialProducts={specialProducts as any} />

      <div className="px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black italic mb-2 uppercase tracking-tighter">Vitrina Principal de Kicks</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Lo mejor de la industria nacional. Reserva por 24h y asegura tu estilo.</p>
        </div>

        {regularProducts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 font-black uppercase italic tracking-widest text-sm">Estamos surtiendo la bodega... ¡Vuelve pronto!</p>
          </div>
        ) : (
          <ProductList products={regularProducts as any} />
        )}
      </div>

      <StoresShowcase stores={stores as any} />
    </div>
  );
}
