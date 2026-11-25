import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { DatabaseService } from '../database/database.service.js';
import { Cart, CartItem } from './cart.interface.js';

const MAX_QUANTITY = 99;

type CartItemRow = Omit<CartItem, 'lineTotal'>;

@Injectable()
export class CartService {
  constructor(private readonly db: DatabaseService) {}

  // A missing or unknown cart id simply means an empty cart. Viewing the cart
  // doesn't create one, so visitors who never add anything leave no rows.
  async getCart(cartId: string | undefined): Promise<Cart> {
    if (!this.isValidId(cartId)) {
      return this.toCart([]);
    }

    // JOIN takes the current name and price from products for every item
    const rows = await this.db.query<CartItemRow>(
      `SELECT p.id AS "productId", p.slug, p.name, p.brand, p.price, p.stock,
              ci.quantity
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1
       ORDER BY ci.created_at, p.id`,
      [cartId],
    );

    return this.toCart(rows);
  }

  // Adds a product, or increases its quantity if it's already in the cart.
  // Returns the cart id too, because a new cart may have been created.
  async addItem(
    cartId: string | undefined,
    productId: number,
    quantity = 1,
  ): Promise<{ cartId: string; cart: Cart }> {
    const [product] = await this.db.query<{ stock: number }>(
      'SELECT stock FROM products WHERE id = $1',
      [productId],
    );
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const limit = Math.min(product.stock, MAX_QUANTITY);
    // Fail before creating a cart, so an impossible request leaves no empty cart
    if (quantity > limit) {
      throw this.stockLimitError(limit);
    }

    const id = await this.findOrCreateCart(cartId);

    // ON CONFLICT: the product is already in this cart (same primary key), so
    // add to its quantity instead of inserting a second row.
    // The WHERE checks the limit in the same statement, so two quick clicks
    // can't push the quantity above the stock. If the limit would be exceeded,
    // nothing changes and RETURNING gives no rows.
    // ::uuid and ::int tell Postgres the parameter types, which it can't
    // guess inside a SELECT.
    const [item] = await this.db.query<{ quantity: number }>(
      `INSERT INTO cart_items (cart_id, product_id, quantity)
       SELECT $1::uuid, $2::int, $3::int
       WHERE $3::int <= $4::int
       ON CONFLICT (cart_id, product_id) DO UPDATE
         SET quantity = cart_items.quantity + EXCLUDED.quantity,
             updated_at = now()
         WHERE cart_items.quantity + EXCLUDED.quantity <= $4::int
       RETURNING quantity`,
      [id, productId, quantity, limit],
    );
    if (!item) {
      throw this.stockLimitError(limit);
    }

    await this.touchCart(id);
    return { cartId: id, cart: await this.getCart(id) };
  }

  private async findOrCreateCart(cartId: string | undefined): Promise<string> {
    if (this.isValidId(cartId)) {
      const [cart] = await this.db.query<{ id: string }>(
        'SELECT id FROM carts WHERE id = $1',
        [cartId],
      );
      if (cart) return cart.id;
    }

    // DEFAULT VALUES: every column uses its default, including a new UUID
    const [created] = await this.db.query<{ id: string }>(
      'INSERT INTO carts DEFAULT VALUES RETURNING id',
    );
    return created.id;
  }

  // updated_at shows when the cart was last used, e.g. to clean up old carts
  private async touchCart(cartId: string): Promise<void> {
    await this.db.query('UPDATE carts SET updated_at = now() WHERE id = $1', [
      cartId,
    ]);
  }

  // The id comes from a cookie, which anyone can edit. Postgres would throw
  // an error for text that isn't a UUID, so check the format first.
  private isValidId(cartId: string | undefined): cartId is string {
    return cartId !== undefined && isUUID(cartId);
  }

  private stockLimitError(limit: number): ConflictException {
    return new ConflictException(
      limit === 0
        ? 'This product is out of stock'
        : `You can add at most ${limit} of this product`,
    );
  }

  private toCart(rows: CartItemRow[]): Cart {
    const items = rows.map((row) => ({
      ...row,
      lineTotal: row.price * row.quantity,
    }));

    return {
      items,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    };
  }
}
