import { ProductList } from "@/features/products/ProductList";
import { PromoBanner } from "@/features/products/PromoBanner";
import { SpecialOffersSection } from "@/features/products/SpecialOffersSection";
import { StoresShowcase } from "@/components/layout/StoresShowcase";
import { PublicityStand } from "@/components/layout/PublicityStand";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Product = Record<string, any>;

export default async function ProductsPage() {
  const supabase = await createClient();
  const [{ data: products, error: productsError }, { data: variants, error: variantsError }, { data: stores, error: storesError }] = await Promise.all([
    supabase.from("products").select("*").eq("active", true).order("salesCount", { ascending: false }),
    supabase.from("product_variants").select("*").eq("active", true),
    supabase.from("stores").select("*").eq("active", true),
  ]);

  if (productsError) throw new Error(`No se pudieron cargar los productos: ${productsError.message}`);
  if (variantsError) throw new Error(`No se pudieron cargar las variantes: ${variantsError.message}`);
  if (storesError) throw new Error(`No se pudieron cargar las tiendas: ${storesError.message}`);

  const storeMap = new Map((stores ?? []).map((store) => [store.id, store]));
  const variantsByProduct = new Map<string, Product[]>();

  for (const variant of variants ?? []) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push({ ...variant, store: storeMap.get(variant.store_id) ?? null });
    variantsByProduct.set(variant.product_id, list);
  }

  const allProducts = (products ?? []).map((product) => ({
    ...product,
    variants: variantsByProduct.get(product.id) ?? [],
  }));
  const specialProducts = allProducts.filter((product) => product.isSpecial);
  const regularProducts = allProducts.filter((product) => !product.isSpecial);

  return (
    <div className="space-y-20 pb-20">
      <PromoBanner />
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
      <div className="px-4 max-w-[1600px] mx-auto">
        <SpecialOffersSection specialProducts={specialProducts as any} />
      </div>
      <PublicityStand />
      <StoresShowcase stores={stores ?? []} />
      <div className="text-center py-10 opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[1em] text-gray-400">Orígenes Kicks 2026</p>
      </div>
    </div>
  );
}