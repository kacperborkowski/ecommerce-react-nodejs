// Delivery and payment methods offered at checkout. The prices live on the
// server, because the order total is calculated here, not in the browser.
// The ids match the CHECK constraints in the orders table.

export const DELIVERY_METHODS = [
  { id: 'courier', label: 'Courier', price: 1499 },
  { id: 'parcel_locker', label: 'Parcel locker', price: 999 },
  { id: 'pickup', label: 'Pickup in store', price: 0 },
] as const;

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Card' },
  { id: 'blik', label: 'BLIK' },
  { id: 'bank_transfer', label: 'Bank transfer' },
  { id: 'cash_on_delivery', label: 'Cash on delivery' },
] as const;

export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]['id'];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id'];

export const DELIVERY_METHOD_IDS = DELIVERY_METHODS.map((method) => method.id);
export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map((method) => method.id);

export function deliveryPrice(method: DeliveryMethod): number {
  return DELIVERY_METHODS.find((item) => item.id === method)?.price ?? 0;
}
