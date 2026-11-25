// Values accepted by the backend (see backend/src/products/product.interface.ts)
export const PRODUCT_CATEGORIES = ['smartphones', 'laptops', 'headphones', 'smartwatches'] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const PRODUCT_SORTS = ['price_asc', 'price_desc', 'name_asc'] as const

export type ProductSort = (typeof PRODUCT_SORTS)[number]

// Mirrors the Product returned by the backend (GET /api/products)
export type Product = {
  id: number
  slug: string
  name: string
  brand: string
  category: ProductCategory
  description: string
  price: number
  stock: number
  // e.g. /images/products/voltix-nova-12.svg, or null when there's no image
  imageUrl: string | null
}

// Query string params accepted by GET /api/products. Prices are in grosze.
export type ProductsQuery = {
  q?: string
  category?: ProductCategory
  brand?: string[]
  minPrice?: number
  maxPrice?: number
  sort?: ProductSort
}

// One option in the filters panel, e.g. { value: 'Voltix', count: 6 }
export type FacetValue = {
  value: string
  count: number
}

// Mirrors GET /api/products/facets. Prices are in grosze.
export type ProductFacets = {
  categories: FacetValue[]
  brands: FacetValue[]
  price: { min: number | null; max: number | null }
}
