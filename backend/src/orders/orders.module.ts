import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  controllers: [CheckoutController, OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
