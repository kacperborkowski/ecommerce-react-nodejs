import { apiGet, apiPost } from '@/shared/api/client'
import type { CheckoutOptions, Order, PlaceOrderRequest } from '../types'

export function getCheckoutOptions(): Promise<CheckoutOptions> {
  return apiGet<CheckoutOptions>('/checkout/options')
}

export function placeOrder(request: PlaceOrderRequest): Promise<Order> {
  return apiPost<Order>('/orders', request)
}

export function getOrder(id: string): Promise<Order> {
  return apiGet<Order>(`/orders/${encodeURIComponent(id)}`)
}
