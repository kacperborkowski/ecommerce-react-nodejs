import { apiGet } from '@/shared/api/client'
import type { Product } from '../types'

export function getProducts(): Promise<Product[]> {
  return apiGet<Product[]>('/products')
}
