import { apiDelete, apiGet, apiPatch, apiPost } from '@/shared/api/client'
import type { Cart } from '../types'

// The cart id travels in an httpOnly cookie that the browser sends by itself,
// so none of these functions needs to know it

export function getCart(): Promise<Cart> {
  return apiGet<Cart>('/cart')
}

export function addCartItem(productId: number, quantity = 1): Promise<Cart> {
  return apiPost<Cart>('/cart/items', { productId, quantity })
}

export function updateCartItem(productId: number, quantity: number): Promise<Cart> {
  return apiPatch<Cart>(`/cart/items/${productId}`, { quantity })
}

export function removeCartItem(productId: number): Promise<Cart> {
  return apiDelete<Cart>(`/cart/items/${productId}`)
}
