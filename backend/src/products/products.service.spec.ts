import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service.js';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('returns all 20 products', () => {
    expect(service.findAll()).toHaveLength(20);
  });

  it('returns products with unique ids and slugs', () => {
    const products = service.findAll();

    expect(new Set(products.map((product) => product.id)).size).toBe(20);
    expect(new Set(products.map((product) => product.slug)).size).toBe(20);
  });
});
