import { Controller, Get } from '@nestjs/common';
import { DELIVERY_METHODS, PAYMENT_METHODS } from './checkout-options.js';

@Controller('checkout')
export class CheckoutController {
  // GET /api/checkout/options
  // The checkout form shows these, so prices and labels exist in one place
  @Get('options')
  getOptions() {
    return {
      deliveryMethods: DELIVERY_METHODS,
      paymentMethods: PAYMENT_METHODS,
    };
  }
}
