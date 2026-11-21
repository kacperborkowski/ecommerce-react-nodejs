import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { ProductsModule } from './products/products.module.js';

@Module({
  imports: [
    // Loads variables from backend/.env
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProductsModule,
  ],
})
export class AppModule {}
