export type ProductCategory = 'smartphones' | 'laptops' | 'headphones' | 'smartwatches'

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

// Query string params accepted by GET /api/products
export type ProductsQuery = {
  q?: string
}
