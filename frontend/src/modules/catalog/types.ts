export type ProductCategory = 'smartphones' | 'laptops' | 'headphones' | 'smartwatches'

// Mirrors the Product returned by the backend (GET /api/products)
export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: ProductCategory
  description: string
  price: number
  stock: number
}
