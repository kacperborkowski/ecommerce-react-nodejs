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
});
