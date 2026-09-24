import { ProductList } from "@/features/products/ProductList";
import { PromoBanner } from "@/features/products/PromoBanner";
import { SpecialOffersSection } from "@/features/products/SpecialOffersSection";
import { StoresShowcase } from "@/components/layout/StoresShowcase";
import { PublicityStand } from "@/components/layout/PublicityStand";
import { createClient } from "@/lib/supabase-server";
import { releaseExpiredReservationsInternal } from "@/lib/reservations";

export const dynamic = "force-dynamic";

type Product = Record<string, any>;

export default async function ProductsPage() {
  await releaseExpiredReservationsInternal();

  const supabase = await createClient();
  const [
    { data: products, error: productsError },
    { data: variants, error: variantsError },
    { data: stores, error: storesError },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).order("salesCount", { ascending: false }),
    supabase.from("product_variants").select("*").eq("active", true),
    supabase.from("stores").select("*").eq("active", true),
  ]);

  if (productsError) throw new Error("No se pudieron cargar los productos.");
  if (variantsError) throw new Error("No se pudieron cargar las variantes.");
  if (storesError) throw new Error("No se pudieron cargar las tiendas.");

  const storeMap = new Map((stores ?? []).map((store) => [store.id, store]));
  const variantsByProduct = new Map<string, Product[]>();

  for (const variant of variants ?? []) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push({ ...variant, store: storeMap.get(variant.store_id) ?? null });
    variantsByProduct.set(variant.product_id, list);
  }

  const allProducts = (products ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    basePrice: Number(product.basePrice ?? product.price ?? 0),
    discountPrice: product.discountPrice == null ? null : Number(product.discountPrice),
    isSpecial: Boolean(product.isSpecial),
    salesCount: Number(product.salesCount ?? 0),
    active: Boolean(product.active),
    imageUrl: product.imageUrl ?? product.image_url ?? null,
    model3dUrl: product.model3d_url ?? product.model3dUrl ?? null,
    variants: variantsByProduct.get(product.id) ?? [],
  }));

  const specialProducts = allProducts.filter((product) => product.isSpecial);
  const regularProducts = allProducts.filter((product) => !product.isSpecial);

  return (
    <div className="space-y-16 pb-16">
      <PromoBanner />
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter sm:text-4xl">Vitrina Principal de Kicks</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600 sm:text-xs">Horma nacional · calidad de exportación · reserva por 24h</p>
        </div>
        {regularProducts.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center">
            <p className="text-sm font-black uppercase italic tracking-widest text-gray-600">Surtiendo la bodega... vuelve pronto.</p>
          </div>
        ) : <ProductList products={regularProducts as any} />}
      </div>

      <div className="mx-auto max-w-[1600px] px-3 sm:px-4">
        <SpecialOffersSection specialProducts={specialProducts as any} />
      </div>
      <PublicityStand />
      <StoresShowcase stores={stores ?? []} />
      <div className="px-4 py-6 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.55em] text-gray-500">Orígenes Kicks 2026</p>
      </div>
    </div>
  );
}
