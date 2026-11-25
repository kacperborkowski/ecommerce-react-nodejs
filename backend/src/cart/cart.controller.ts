import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { Cart } from './cart.interface.js';
import { CartService } from './cart.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

const CART_COOKIE = 'cartId';

const CART_COOKIE_OPTIONS: CookieOptions = {
  // JavaScript in the browser can't read the cookie, so a malicious script
  // can't steal the cart id. The browser still sends it with every request.
  httpOnly: true,
  // Not sent with requests started by other websites
  sameSite: 'lax',
  // Over HTTPS only, outside local development
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, in milliseconds
  path: '/',
};

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /api/cart
  @Get()
  getCart(@Req() req: Request): Promise<Cart> {
    return this.cartService.getCart(this.readCartId(req));
  }

  // POST /api/cart/items  { "productId": 3, "quantity": 1 }
  // passthrough: true lets us set a cookie and still return the cart as JSON
  @Post('items')
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: AddCartItemDto,
  ): Promise<Cart> {
    const { cartId, cart } = await this.cartService.addItem(
      this.readCartId(req),
      body.productId,
      body.quantity,
    );

    // Set (or refresh) the cookie, so the browser remembers this cart
    res.cookie(CART_COOKIE, cartId, CART_COOKIE_OPTIONS);
    return cart;
  }

  // PATCH /api/cart/items/3  { "quantity": 2 }
  // ParseIntPipe turns "3" from the URL into a number, or returns 400
  @Patch('items/:productId')
  updateItem(
    @Req() req: Request,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: UpdateCartItemDto,
  ): Promise<Cart> {
    return this.cartService.updateItem(
      this.readCartId(req),
      productId,
      body.quantity,
    );
  }

  // DELETE /api/cart/items/3
  @Delete('items/:productId')
  removeItem(
    @Req() req: Request,
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<Cart> {
    return this.cartService.removeItem(this.readCartId(req), productId);
  }

  private readCartId(req: Request): string | undefined {
    const value: unknown = req.cookies?.[CART_COOKIE];
    return typeof value === 'string' ? value : undefined;
  }
}
