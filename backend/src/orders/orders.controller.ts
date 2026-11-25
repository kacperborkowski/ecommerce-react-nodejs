import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { clearCartCookie, readCartId } from '../cart/cart-cookie.js';
import { PlaceOrderDto } from './dto/place-order.dto.js';
import { Order } from './order.interface.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /api/orders: turns the cart from the cookie into an order
  @Post()
  async placeOrder(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: PlaceOrderDto,
  ): Promise<Order> {
    const { order, created } = await this.ordersService.placeOrder(
      readCartId(req),
      body,
    );

    // 201 Created for a new order, 200 OK when the same request is repeated
    res.status(created ? HttpStatus.CREATED : HttpStatus.OK);
    // The cart was turned into the order, so the browser can forget it
    clearCartCookie(res);
    return order;
  }

  // GET /api/orders/:id, for the order confirmation page.
  // The id is a random UUID, so it works like a private link.
  // ParseUUIDPipe answers 400 for anything that isn't a UUID.
  @Get(':id')
  getOrder(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.ordersService.getOrder(id);
  }
}
