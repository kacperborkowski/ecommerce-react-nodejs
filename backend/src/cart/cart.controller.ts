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
import type { Request, Response } from 'express';
import { readCartId, setCartCookie } from './cart-cookie.js';
import { Cart } from './cart.interface.js';
import { CartService } from './cart.service.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /api/cart
  @Get()
  getCart(@Req() req: Request): Promise<Cart> {
    return this.cartService.getCart(readCartId(req));
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
      readCartId(req),
      body.productId,
      body.quantity,
    );

    setCartCookie(res, cartId);
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
      readCartId(req),
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
    return this.cartService.removeItem(readCartId(req), productId);
  }
}
