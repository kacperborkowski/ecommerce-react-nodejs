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
