// Single source of truth: used for the type and for validating ?category=
export const PRODUCT_CATEGORIES = [
  'smartphones',
  'laptops',
  'headphones',
  'smartwatches',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  // Price in grosze (1 PLN = 100 grosze) to avoid floating point rounding errors
  price: number;
  stock: number;
}
