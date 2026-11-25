import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/client'
import { getProduct } from '../api/getProduct'

const MAX_RETRIES = 1

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    // A missing product won't appear on retry, so don't repeat 404 requests
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < MAX_RETRIES,
  })
}
