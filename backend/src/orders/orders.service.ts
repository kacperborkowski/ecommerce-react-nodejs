import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import pg from 'pg';
import { DatabaseService } from '../database/database.service.js';
import { deliveryPrice } from './checkout-options.js';
import type { DeliveryMethod, PaymentMethod } from './checkout-options.js';
import { PlaceOrderDto } from './dto/place-order.dto.js';
import { Order, OrderItem } from './order.interface.js';

type CartLine = {
  productId: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
};

type OrderRow = {
  id: string;
  status: Order['status'];
  created_at: Date;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  street: string;
  postal_code: string;
  city: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  items_total: number;
  delivery_price: number;
  total: number;
};

@Injectable()
export class OrdersService {
  constructor(private readonly db: DatabaseService) {}

  // Turns the cart into an order. Returns `created: false` when an order with
  // this idempotency key already exists (e.g. after a double click).
  async placeOrder(
    cartId: string | undefined,
    dto: PlaceOrderDto,
  ): Promise<{ order: Order; created: boolean }> {
    const existingId = await this.findByIdempotencyKey(dto.idempotencyKey);
    if (existingId) {
      return { order: await this.getOrder(existingId), created: false };
    }

    if (!cartId || !isUUID(cartId)) {
      throw new BadRequestException('Your cart is empty');
    }

    try {
      const orderId = await this.db.transaction(async (tx) => {
        // 1. Read the cart and LOCK the product rows (FOR UPDATE). Another
        //    order for the same products has to wait until we finish, so two
        //    people can't both buy the last piece. ORDER BY p.id locks rows
        //    in the same order every time, which prevents deadlocks.
        const lines = await tx.query<CartLine>(
          `SELECT p.id AS "productId", p.name, p.price, p.stock, ci.quantity
           FROM cart_items ci
           JOIN products p ON p.id = ci.product_id
           WHERE ci.cart_id = $1
           ORDER BY p.id
           FOR UPDATE OF p`,
          [cartId],
        );

        if (lines.length === 0) {
          throw new BadRequestException('Your cart is empty');
        }

        // 2. Stock could have changed since the product was added to the cart
        const unavailable = lines.filter((line) => line.quantity > line.stock);
        if (unavailable.length > 0) {
          const names = unavailable.map((line) => line.name).join(', ');
          throw new ConflictException(
            `Not enough stock for: ${names}. Please update your cart.`,
          );
        }

        // 3. Totals from database prices, never from the request
        const itemsTotal = lines.reduce(
          (sum, line) => sum + line.price * line.quantity,
          0,
        );
        const delivery = deliveryPrice(dto.deliveryMethod);
        const { customer, address } = dto;

        const [order] = await tx.query<{ id: string }>(
          `INSERT INTO orders (
             idempotency_key, email, first_name, last_name, phone,
             street, postal_code, city, delivery_method, payment_method,
             items_total, delivery_price, total
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING id`,
          [
            dto.idempotencyKey,
            customer.email,
            customer.firstName,
            customer.lastName,
            customer.phone,
            address.street,
            address.postalCode,
            address.city,
            dto.deliveryMethod,
            dto.paymentMethod,
            itemsTotal,
            delivery,
            itemsTotal + delivery,
          ],
        );

        // 4. Copy the cart into order_items, with name and price "frozen"
        await tx.query(
          `INSERT INTO order_items
             (order_id, product_id, product_name, unit_price, quantity, line_total)
           SELECT $1, p.id, p.name, p.price, ci.quantity, p.price * ci.quantity
           FROM cart_items ci
           JOIN products p ON p.id = ci.product_id
           WHERE ci.cart_id = $2`,
          [order.id, cartId],
        );

        // 5. Take the ordered pieces out of stock
        await tx.query(
          `UPDATE products p
           SET stock = p.stock - ci.quantity, updated_at = now()
           FROM cart_items ci
           WHERE ci.cart_id = $1 AND ci.product_id = p.id`,
          [cartId],
        );

        // 6. The cart is done (its items go too, thanks to ON DELETE CASCADE)
        await tx.query('DELETE FROM carts WHERE id = $1', [cartId]);

        return order.id;
      });

      return { order: await this.getOrder(orderId), created: true };
    } catch (error) {
      // Two identical requests at the very same moment: both passed the check
      // at the top, but the UNIQUE constraint let only one of them insert.
      // The other one returns the order that won.
      if (this.isDuplicateIdempotencyKey(error)) {
        const id = await this.findByIdempotencyKey(dto.idempotencyKey);
        if (id) return { order: await this.getOrder(id), created: false };
      }
      throw error;
    }
  }

  async getOrder(id: string): Promise<Order> {
    const [row] = await this.db.query<OrderRow>(
      'SELECT * FROM orders WHERE id = $1',
      [id],
    );
    if (!row) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    const items = await this.db.query<OrderItem>(
      `SELECT product_id AS "productId", product_name AS name,
              unit_price AS "unitPrice", quantity, line_total AS "lineTotal"
       FROM order_items
       WHERE order_id = $1
       ORDER BY product_id`,
      [id],
    );

    return {
      id: row.id,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      customer: {
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
      },
      address: {
        street: row.street,
        postalCode: row.postal_code,
        city: row.city,
      },
      deliveryMethod: row.delivery_method,
      paymentMethod: row.payment_method,
      items,
      itemsTotal: row.items_total,
      deliveryPrice: row.delivery_price,
      total: row.total,
    };
  }

  private async findByIdempotencyKey(key: string): Promise<string | undefined> {
    const [order] = await this.db.query<{ id: string }>(
      'SELECT id FROM orders WHERE idempotency_key = $1',
      [key],
    );
    return order?.id;
  }

  // 23505 is the Postgres error code for "unique constraint violated"
  private isDuplicateIdempotencyKey(error: unknown): boolean {
    return (
      error instanceof pg.DatabaseError &&
      error.code === '23505' &&
      error.constraint === 'orders_idempotency_key_key'
    );
  }
}
