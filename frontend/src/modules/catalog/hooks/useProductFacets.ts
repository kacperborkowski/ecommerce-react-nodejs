import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getProductFacets } from '../api/getProductFacets'
import type { ProductsQuery } from '../types'

export function useProductFacets({ sort: _sort, ...filters }: ProductsQuery = {}) {
  return useQuery({
    // Sorting doesn't change the counts, so it's left out of the key and the request
    queryKey: ['productFacets', filters],
    queryFn: () => getProductFacets(filters),
    // Keep the old counts on screen while new ones load, so the panel doesn't jump
    placeholderData: keepPreviousData,
  })
}
