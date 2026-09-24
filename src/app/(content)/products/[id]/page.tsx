import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { Product3DViewer } from "@/components/products/Product3DViewer";
import { ProductDetailView } from "@/features/products/ProductDetailView";

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true }
  });

  if (!product) {
    // Intentar buscar por slug si no se encuentra por ID
    const productBySlug = await prisma.product.findUnique({
      where: { slug: id },
      include: { variants: true }
    });

    if (!productBySlug) notFound();
    return <ProductDetailView product={productBySlug as any} />;
  }

  return <ProductDetailView product={product as any} />;
}
