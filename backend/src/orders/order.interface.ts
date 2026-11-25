import type { DeliveryMethod, PaymentMethod } from './checkout-options.js';

export interface OrderItem {
  productId: number;
  // Name and price as they were when the order was placed
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

// Response of POST /api/orders and GET /api/orders/:id. Amounts in grosze.
export interface Order {
  id: string;
  status: 'placed' | 'paid' | 'shipped' | 'cancelled';
  createdAt: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  itemsTotal: number;
  deliveryPrice: number;
  total: number;
}
