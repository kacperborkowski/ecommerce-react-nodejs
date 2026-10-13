import { apiGet } from '@/shared/api/client'
import type { Product, ProductsQuery } from '../types'

export function getProducts(query: ProductsQuery = {}): Promise<Product[]> {
  return apiGet<Product[]>('/products', query)
}
