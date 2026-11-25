import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service.js';
import { ProductsService } from './products.service.js';

// Unit tests check the SQL the service builds, using a fake DatabaseService.
// The real search results are tested against the database in test/app.e2e-spec.ts.
describe('ProductsService', () => {
  let service: ProductsService;
  const query = vi.fn();

  beforeEach(async () => {
    query.mockReset().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: DatabaseService, useValue: { query } },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  const lastCall = () => {
    const [sql, params] = query.mock.lastCall as [string, unknown[]];
    return { sql: sql.replace(/\s+/g, ' '), params };
  };

  it('returns rows from the database', async () => {
    const rows = [{ id: 1, name: 'Voltix Nova 12' }];
    query.mockResolvedValue(rows);

    await expect(service.findAll()).resolves.toBe(rows);
  });

  it('selects all products without a WHERE clause for an empty query', async () => {
    await service.findAll({ q: '   ' });

    expect(lastCall().sql).not.toContain('WHERE');
    expect(lastCall().params).toEqual([]);
  });

  it('adds one ILIKE condition per word', async () => {
    await service.findAll({ q: ' nova  pro ' });

    expect(lastCall().sql).toContain('WHERE name ILIKE $1 AND name ILIKE $2');
    expect(lastCall().params).toEqual(['%nova%', '%pro%']);
  });

  it('passes user input only as parameters, never inside the SQL', async () => {
    await service.findAll({ q: "'; DROP TABLE products; --" });

    expect(lastCall().sql).not.toContain('DROP TABLE');
    expect(lastCall().params).toEqual([
      "%';%",
      '%DROP%',
      '%TABLE%',
      '%products;%',
      '%--%',
    ]);
  });

  it('escapes LIKE wildcards in the search phrase', async () => {
    await service.findAll({ q: '100%_off' });

    expect(lastCall().params).toEqual(['%100\\%\\_off%']);
  });

  it('combines all filters with AND, numbering parameters in order', async () => {
    await service.findAll({
      q: 'watch',
      category: 'smartwatches',
      brand: ['Voltix', 'Aurel'],
      minPrice: 100000,
      maxPrice: 200000,
    });

    expect(lastCall().sql).toContain(
      'WHERE name ILIKE $1 AND category = $2 AND brand = ANY($3)' +
        ' AND price >= $4 AND price <= $5',
    );
    expect(lastCall().params).toEqual([
      '%watch%',
      'smartwatches',
      ['Voltix', 'Aurel'],
      100000,
      200000,
    ]);
  });

  it('accepts a price limit of 0', async () => {
    await service.findAll({ maxPrice: 0 });

    expect(lastCall().sql).toContain('WHERE price <= $1');
    expect(lastCall().params).toEqual([0]);
  });

  describe('sorting', () => {
    it('uses the default catalog order without sort', async () => {
      await service.findAll();

      expect(lastCall().sql).toMatch(/ORDER BY id$/);
    });

    it.each([
      ['price_asc', 'ORDER BY price ASC, id'],
      ['price_desc', 'ORDER BY price DESC, id'],
      ['name_asc', 'ORDER BY name ASC, id'],
    ] as const)('maps sort=%s to %s', async (sort, orderBy) => {
      await service.findAll({ sort });

      expect(lastCall().sql).toMatch(new RegExp(`${orderBy}$`));
    });
  });

  describe('getFacets', () => {
    // getFacets sends 3 queries; find the one that groups by the given column
    const callFor = (fragment: string) => {
      const calls = query.mock.calls as [string, unknown[]][];
      const call = calls.find(([sql]) => sql.includes(fragment));
      if (!call) throw new Error(`No query containing "${fragment}"`);
      return { sql: call[0].replace(/\s+/g, ' '), params: call[1] };
    };

    beforeEach(() => {
      query.mockImplementation((sql: string) =>
        Promise.resolve(sql.includes('min(price)') ? [{ min: 1, max: 2 }] : []),
      );
    });

    it('ignores the brand filter when counting brands', async () => {
      await service.getFacets({ category: 'smartwatches', brand: ['Voltix'] });

      const brands = callFor('GROUP BY brand');
      expect(brands.sql).toContain('WHERE category = $1 GROUP BY brand');
      expect(brands.params).toEqual(['smartwatches']);
    });

    it('ignores the category filter when counting categories', async () => {
      await service.getFacets({ category: 'smartwatches', brand: ['Voltix'] });

      const categories = callFor('GROUP BY category');
      expect(categories.sql).toContain(
        'WHERE brand = ANY($1) GROUP BY category',
      );
      expect(categories.params).toEqual([['Voltix']]);
    });

    it('ignores the price filters when computing the price range', async () => {
      const facets = await service.getFacets({ q: 'nova', minPrice: 100 });

      const price = callFor('min(price)');
      expect(price.sql).toContain('WHERE name ILIKE $1');
      expect(price.params).toEqual(['%nova%']);
      expect(facets.price).toEqual({ min: 1, max: 2 });
    });
  });

  describe('findBySlug', () => {
    it('looks the product up by slug passed as a parameter', async () => {
      const product = { id: 1, slug: 'voltix-nova-12' };
      query.mockResolvedValue([product]);

      await expect(service.findBySlug('voltix-nova-12')).resolves.toBe(product);
      expect(lastCall().sql).toContain('WHERE slug = $1');
      expect(lastCall().params).toEqual(['voltix-nova-12']);
    });

    it('throws NotFoundException when no product matches', async () => {
      await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
