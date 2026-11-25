import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchProductsDto } from './dto/search-products.dto.js';
import { Product } from './product.interface.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /api/products?q=nova
  @Get()
  findAll(@Query() query: SearchProductsDto): Promise<Product[]> {
    return this.productsService.findAll(query);
  }

  // GET /api/products/voltix-nova-12
  @Get(':slug')
  findOne(@Param('slug') slug: string): Promise<Product> {
    return this.productsService.findBySlug(slug);
  }
}
