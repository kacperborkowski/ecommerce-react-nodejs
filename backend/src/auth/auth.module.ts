import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  // Other modules (e.g. orders, for order history) will ask it who is logged in
  exports: [AuthService],
})
export class AuthModule {}
