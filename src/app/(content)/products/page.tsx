import { ProductList } from "@/features/products/ProductList";
import { PromoBanner } from "@/features/products/PromoBanner";
import { SpecialOffersSection } from "@/features/products/SpecialOffersSection";
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

  const specialProducts = allProducts.filter(p => p.isSpecial);
  const regularProducts = allProducts.filter(p => !p.isSpecial);

  return (
    <div>
      <PromoBanner />

      <SpecialOffersSection specialProducts={specialProducts as any} />

      <div className="mb-8">
        <h1 className="text-3xl font-black italic mb-2 uppercase">Vitrina Principal</h1>
        <p className="text-gray-500">Explora nuestra colección de Kicks. Si reservas uno, tienes 24h para confirmar el pago.</p>
      </div>

      {regularProducts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-gray-400">No hay productos disponibles en este momento.</p>
        </div>
      ) : (
        <ProductList products={regularProducts as any} />
      )}
    </div>
  );
}
