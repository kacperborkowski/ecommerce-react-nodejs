import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { addCartItem, getCart, removeCartItem, updateCartItem } from '../api/cartApi'
import type { Cart, CartItem } from '../types'

// One cache entry shared by the header badge, the product page and the cart page
const CART_KEY = ['cart']
// Marks all cart mutations, so we can check if another one is still running
const CART_MUTATION_KEY = ['cart', 'mutation']

export function useCart() {
  return useQuery({ queryKey: CART_KEY, queryFn: getCart })
}

// Every cart endpoint returns the whole cart, so after a change we put the
// response straight into the cache instead of asking for the cart again.
// If another change is still in progress, its response will be newer, so we
// skip this one (otherwise a slow first response could undo the second change).
function saveCart(queryClient: QueryClient, cart: Cart) {
  if (queryClient.isMutating({ mutationKey: CART_MUTATION_KEY }) <= 1) {
    queryClient.setQueryData(CART_KEY, cart)
  }
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: CART_MUTATION_KEY,
    mutationFn: ({ productId, quantity }: { productId: number; quantity?: number }) =>
      addCartItem(productId, quantity),
    onSuccess: (cart) => saveCart(queryClient, cart),
  })
}

// Optimistic update: the cart on screen changes immediately, before the
// server answers. If the server says no (e.g. not enough stock), we roll back.
function useOptimisticCartMutation<Variables>(
  mutationFn: (variables: Variables) => Promise<Cart>,
  changeItems: (items: CartItem[], variables: Variables) => CartItem[],
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: CART_MUTATION_KEY,
    mutationFn,
    onMutate: async (variables) => {
      // Stop a running GET /api/cart, so it can't overwrite our change
      await queryClient.cancelQueries({ queryKey: CART_KEY })
      const previous = queryClient.getQueryData<Cart>(CART_KEY)

      if (previous) {
        queryClient.setQueryData(CART_KEY, withTotals(changeItems(previous.items, variables)))
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CART_KEY, context.previous)
      }
    },
    onSuccess: (cart) => saveCart(queryClient, cart),
  })
}

export function useUpdateCartItem() {
  return useOptimisticCartMutation(
    ({ productId, quantity }: { productId: number; quantity: number }) =>
      updateCartItem(productId, quantity),
    (items, { productId, quantity }) =>
      items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
  )
}

export function useRemoveCartItem() {
  return useOptimisticCartMutation(
    (productId: number) => removeCartItem(productId),
    (items, productId) => items.filter((item) => item.productId !== productId),
  )
}

// Only for the optimistic preview. The real totals always come from the server.
function withTotals(items: CartItem[]): Cart {
  const withLineTotals = items.map((item) => ({ ...item, lineTotal: item.price * item.quantity }))

  return {
    items: withLineTotals,
    totalQuantity: withLineTotals.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: withLineTotals.reduce((sum, item) => sum + item.lineTotal, 0),
  }
}
