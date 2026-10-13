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

  const names = (q?: string) =>
    service.findAll({ q }).map((product) => product.name);

  it('returns all 20 products', () => {
    expect(service.findAll()).toHaveLength(20);
  });

  it('returns products with unique ids and slugs', () => {
    const products = service.findAll();

    expect(new Set(products.map((product) => product.id)).size).toBe(20);
    expect(new Set(products.map((product) => product.slug)).size).toBe(20);
  });

  describe('search by name', () => {
    it('returns all products for an empty or blank query', () => {
      expect(service.findAll({ q: '' })).toHaveLength(20);
      expect(service.findAll({ q: '   ' })).toHaveLength(20);
    });

    it('ignores letter case', () => {
      expect(names('NOVA')).toEqual(['Voltix Nova 12', 'Voltix Nova 12 Pro']);
    });

    it('requires every word to match, in any order', () => {
      expect(names('pro nova')).toEqual(['Voltix Nova 12 Pro']);
    });

    it('matches part of a word', () => {
      expect(names('wat')).toEqual([
        'Voltix Watch 5',
        'Voltix Watch 5 Classic',
        'Aurel Watch Ultra',
      ]);
    });

    it('returns an empty list when nothing matches', () => {
      expect(names('lodówka')).toEqual([]);
    });
  });
});
