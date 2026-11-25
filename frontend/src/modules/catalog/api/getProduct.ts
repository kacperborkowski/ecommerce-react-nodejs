import { apiGet } from '@/shared/api/client'
import type { Product } from '../types'

export function getProduct(slug: string): Promise<Product> {
  return apiGet<Product>(`/products/${encodeURIComponent(slug)}`)
}
