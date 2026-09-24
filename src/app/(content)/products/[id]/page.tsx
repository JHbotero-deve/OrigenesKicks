import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { ProductDetailView } from "@/features/products/ProductDetailView";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .or(`id.eq.${id},slug.eq.${id}`)
    .eq("active", true)
    .maybeSingle();

  if (productError || !product) notFound();

  const [{ data: variants }, { data: stores }] = await Promise.all([
    supabase.from("product_variants").select("*").eq("product_id", product.id).eq("active", true),
    supabase.from("stores").select("*").eq("active", true),
  ]);

  const storeMap = new Map((stores ?? []).map((store) => [store.id, store]));

  return (
    <ProductDetailView
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        discountPrice: product.discountPrice,
        imageUrl: product.imageUrl ?? null,
        model3dUrl: product.model3d_url ?? null,
        variants: (variants ?? []).map((variant) => ({
          id: variant.id,
          size: String(variant.size ?? ""),
          color: String(variant.color ?? ""),
          stock: Number(variant.stock ?? 0),
          store: storeMap.get(variant.store_id) ?? null,
        })),
      }}
    />
  );
}
