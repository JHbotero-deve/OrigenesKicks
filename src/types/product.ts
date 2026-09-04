export interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  discountPrice?: number;
  isSpecial: boolean;
  salesCount: number;
  category?: string;
  active: boolean;
  imageUrl?: string;
  sku?: string;
  variants?: Variant[];
}

export interface Variant {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}
