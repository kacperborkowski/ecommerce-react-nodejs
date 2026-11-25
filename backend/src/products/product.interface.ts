// Single source of truth: used for the type and for validating ?category=
export const PRODUCT_CATEGORIES = [
  'smartphones',
  'laptops',
  'headphones',
  'smartwatches',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

// Allowed values of ?sort=
export const PRODUCT_SORTS = ['price_asc', 'price_desc', 'name_asc'] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

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
  // e.g. /images/products/voltix-nova-12.svg, or null when there's no image
  imageUrl: string | null;
}

// One option in the filters panel, e.g. { value: 'Voltix', count: 6 }
export interface FacetValue {
  value: string;
  count: number;
}

// Response of GET /api/products/facets
export interface ProductFacets {
  categories: FacetValue[];
  brands: FacetValue[];
  // Cheapest and most expensive matching product, null when nothing matches
  price: { min: number | null; max: number | null };
}
