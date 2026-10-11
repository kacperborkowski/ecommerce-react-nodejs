import { Injectable } from '@nestjs/common';
import { PRODUCTS } from './data/products.data.js';
import { Product } from './product.interface.js';

@Injectable()
export class ProductsService {
  findAll(): Product[] {
    return PRODUCTS;
  }
}
