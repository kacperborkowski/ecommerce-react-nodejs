import { apiGet } from '@/shared/api/client'
import type { ProductFacets, ProductsQuery } from '../types'

export function getProductFacets(query: ProductsQuery = {}): Promise<ProductFacets> {
  return apiGet<ProductFacets>('/products/facets', query)
}
