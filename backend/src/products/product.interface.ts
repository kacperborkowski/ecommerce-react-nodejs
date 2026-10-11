export type ProductCategory =
  'smartphones' | 'laptops' | 'headphones' | 'smartwatches';

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  // Price in grosze (1 PLN = 100 grosze) to avoid floating point rounding errors
  price: number;
  stock: number;
}
