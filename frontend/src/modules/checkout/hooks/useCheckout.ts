import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/shared/api/client'
import { getCheckoutOptions, getOrder, placeOrder } from '../api/checkoutApi'

export function useCheckoutOptions() {
  return useQuery({
    queryKey: ['checkoutOptions'],
    queryFn: getCheckoutOptions,
    // Delivery prices rarely change, no need to refetch them during a visit
    staleTime: Infinity,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: placeOrder,
    onSuccess: (order) => {
      // The confirmation page can show the order without loading it again
      queryClient.setQueryData(['order', order.id], order)
      // The server deleted the cart, so the header badge must reload it
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      // Stock changed, so cached product pages and lists are out of date
      void queryClient.invalidateQueries({ queryKey: ['product'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id),
    retry: (failureCount, error) =>
      !(error instanceof ApiError && [400, 404].includes(error.status)) && failureCount < 1,
  })
}
