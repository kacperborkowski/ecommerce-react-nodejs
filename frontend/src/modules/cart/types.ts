// Mirrors the cart returned by every /api/cart endpoint. Prices are in grosze.
export type CartItem = {
  productId: number
  slug: string
  name: string
  brand: string
  price: number
  stock: number
  quantity: number
  lineTotal: number
}

export type Cart = {
  items: CartItem[]
  totalQuantity: number
  subtotal: number
}
