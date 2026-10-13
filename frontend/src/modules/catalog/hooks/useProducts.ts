import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProducts } from '../api/getProducts'
import type { ProductsQuery } from '../types'

export function useProducts(query: ProductsQuery = {}) {
  return useQuery({
    // Every query gets its own cache entry, e.g. ['products', { q: 'nova' }]
    queryKey: ['products', query],
    queryFn: () => getProducts(query),
    // Keep showing previous results while the next search is loading
    placeholderData: keepPreviousData,
  })
}
