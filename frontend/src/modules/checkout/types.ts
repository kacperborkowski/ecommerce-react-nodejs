// Mirrors GET /api/checkout/options. Prices are in grosze.
export type DeliveryMethod = 'courier' | 'parcel_locker' | 'pickup'
export type PaymentMethod = 'card' | 'blik' | 'bank_transfer' | 'cash_on_delivery'

export type CheckoutOptions = {
  deliveryMethods: { id: DeliveryMethod; label: string; price: number }[]
  paymentMethods: { id: PaymentMethod; label: string }[]
}

export type Customer = {
  email: string
  firstName: string
  lastName: string
  phone: string
}

export type Address = {
  street: string
  postalCode: string
  city: string
}

// Body of POST /api/orders. No products and no prices: the server takes
// them from the cart and the database.
export type PlaceOrderRequest = {
  idempotencyKey: string
  customer: Customer
  address: Address
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
}

// Mirrors the order returned by POST /api/orders and GET /api/orders/:id
export type Order = {
  id: string
  status: 'placed' | 'paid' | 'shipped' | 'cancelled'
  createdAt: string
  customer: Customer
  address: Address
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  items: { productId: number; name: string; unitPrice: number; quantity: number; lineTotal: number }[]
  itemsTotal: number
  deliveryPrice: number
  total: number
}
