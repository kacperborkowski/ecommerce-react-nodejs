import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';

// Runs against the database from .env, which needs migrations and seed applied:
// npm run db:migrate && npm run db:seed
describe('Products API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const searchNames = async (q: string) => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .query({ q })
      .expect(200);

    return (response.body as { name: string }[]).map((product) => product.name);
  };

  it('GET /api/products returns the product list', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);

    expect(response.body).toHaveLength(20);
    expect(response.body[0]).toMatchObject({
      slug: 'voltix-nova-12',
      name: 'Voltix Nova 12',
      price: 249900,
    });
    expect(typeof response.body[0].id).toBe('number');
  });

  describe('search by name', () => {
    it('ignores letter case', async () => {
      expect(await searchNames('NOVA')).toEqual([
        'Voltix Nova 12',
        'Voltix Nova 12 Pro',
      ]);
    });

    it('requires every word to match, in any order', async () => {
      expect(await searchNames('pro nova')).toEqual(['Voltix Nova 12 Pro']);
    });

    it('matches part of a word', async () => {
      expect(await searchNames('wat')).toEqual([
        'Voltix Watch 5',
        'Voltix Watch 5 Classic',
        'Aurel Watch Ultra',
      ]);
    });

    it('returns an empty list when nothing matches', async () => {
      expect(await searchNames('fridge')).toEqual([]);
    });

    it('treats LIKE wildcards as normal characters', async () => {
      expect(await searchNames('%')).toEqual([]);
    });

    it('is safe against SQL injection', async () => {
      expect(await searchNames("'; DROP TABLE products; --")).toEqual([]);
      expect(await searchNames('')).toHaveLength(20);
    });
  });

  describe('filters', () => {
    const filterNames = async (query: string) => {
      const response = await request(app.getHttpServer())
        .get(`/api/products?${query}`)
        .expect(200);

      return (response.body as { name: string }[]).map(
        (product) => product.name,
      );
    };

    it('filters by category', async () => {
      expect(await filterNames('category=laptops')).toEqual([
        'Nordia Book 14',
        'Nordia Book 16 Pro',
        'Voltix GameBook 15',
        'Pixon Study 13',
        'Aurel Air 13',
      ]);
    });

    it('filters by one or more brands', async () => {
      expect(await filterNames('brand=Pixon')).toEqual([
        'Pixon Lite 4',
        'Pixon Study 13',
        'Pixon Pods Mini',
        'Pixon Fit 2',
      ]);
      expect(
        await filterNames('category=smartwatches&brand=Voltix&brand=Aurel'),
      ).toEqual([
        'Voltix Watch 5',
        'Voltix Watch 5 Classic',
        'Aurel Watch Ultra',
      ]);
    });

    it('filters by price range in grosze, including the limits', async () => {
      expect(await filterNames('minPrice=119900&maxPrice=189900')).toEqual([
        'Nordia X5',
        'Pixon Study 13',
        'Voltix Watch 5',
        'Voltix Watch 5 Classic',
      ]);
    });

    it('combines filters with the search phrase', async () => {
      expect(await filterNames('q=watch&brand=Aurel')).toEqual([
        'Aurel Watch Ultra',
      ]);
    });

    it('returns 400 for invalid filter values', async () => {
      for (const query of [
        'category=fridges',
        'minPrice=abc',
        'minPrice=-1',
        'maxPrice=10.5',
      ]) {
        await request(app.getHttpServer())
          .get(`/api/products?${query}`)
          .expect(400);
      }
    });
  });

  describe('sorting', () => {
    const sortedNames = async (query: string) => {
      const response = await request(app.getHttpServer())
        .get(`/api/products?${query}`)
        .expect(200);

      return (response.body as { name: string }[]).map(
        (product) => product.name,
      );
    };

    it('sorts by price ascending and descending', async () => {
      const cheapestFirst = [
        'Pixon Lite 4',
        'Nordia X5',
        'Voltix Nova 12',
        'Voltix Nova 12 Pro',
        'Aurel Fold 2',
      ];

      expect(await sortedNames('category=smartphones&sort=price_asc')).toEqual(
        cheapestFirst,
      );
      expect(await sortedNames('category=smartphones&sort=price_desc')).toEqual(
        [...cheapestFirst].reverse(),
      );
    });

    it('sorts by name', async () => {
      expect(await sortedNames('category=smartphones&sort=name_asc')).toEqual([
        'Aurel Fold 2',
        'Nordia X5',
        'Pixon Lite 4',
        'Voltix Nova 12',
        'Voltix Nova 12 Pro',
      ]);
    });

    it('keeps a stable order for equal prices', async () => {
      expect(
        await sortedNames('minPrice=189900&maxPrice=189900&sort=price_desc'),
      ).toEqual(['Nordia X5', 'Pixon Study 13']);
    });

    it('returns 400 for an unknown sort, including SQL injection attempts', async () => {
      for (const sort of ['price', 'id; DROP TABLE products']) {
        await request(app.getHttpServer())
          .get('/api/products')
          .query({ sort })
          .expect(400);
      }
    });
  });

  describe('GET /api/products/facets', () => {
    const getFacets = async (query = '') => {
      const response = await request(app.getHttpServer())
        .get(`/api/products/facets?${query}`)
        .expect(200);

      return response.body as {
        categories: { value: string; count: number }[];
        brands: { value: string; count: number }[];
        price: { min: number | null; max: number | null };
      };
    };

    it('counts all products without filters', async () => {
      const facets = await getFacets();

      expect(facets.categories).toEqual([
        { value: 'headphones', count: 5 },
        { value: 'laptops', count: 5 },
        { value: 'smartphones', count: 5 },
        { value: 'smartwatches', count: 5 },
      ]);
      expect(facets.brands).toEqual([
        { value: 'Aurel', count: 5 },
        { value: 'Nordia', count: 5 },
        { value: 'Pixon', count: 4 },
        { value: 'Voltix', count: 6 },
      ]);
      expect(facets.price).toEqual({ min: 14900, max: 819900 });
    });

    it('keeps other brands countable when one brand is selected', async () => {
      const facets = await getFacets('category=smartwatches&brand=Voltix');

      // Brands ignore the brand filter, but respect the category
      expect(facets.brands).toEqual([
        { value: 'Aurel', count: 1 },
        { value: 'Nordia', count: 1 },
        { value: 'Pixon', count: 1 },
        { value: 'Voltix', count: 2 },
      ]);
      // Categories ignore the category filter, but respect the brand
      expect(facets.categories).toContainEqual({
        value: 'laptops',
        count: 1,
      });
    });

    it('returns empty facets when nothing matches the search', async () => {
      expect(await getFacets('q=fridge')).toEqual({
        categories: [],
        brands: [],
        price: { min: null, max: null },
      });
    });

    it('is not mistaken for a product slug', async () => {
      const facets = await getFacets();
      expect(facets).not.toHaveProperty('slug');
    });
  });

  describe('product images', () => {
    it('returns the image address with products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/voltix-nova-12')
        .expect(200);

      expect(response.body).toMatchObject({
        imageUrl: '/images/products/voltix-nova-12.svg',
      });
    });

    it('serves the image file', async () => {
      const response = await request(app.getHttpServer())
        .get('/images/products/voltix-nova-12.svg')
        .expect(200);

      expect(response.headers['content-type']).toContain('image/svg+xml');
      expect(response.headers['cache-control']).toContain('max-age=86400');
    });

    it('returns 404 for missing files and paths outside the images folder', async () => {
      await request(app.getHttpServer())
        .get('/images/products/missing.svg')
        .expect(404);
      await request(app.getHttpServer())
        .get('/images/..%2F..%2F.env')
        .expect(404);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('returns a single product', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/voltix-nova-12-pro')
        .expect(200);

      expect(response.body).toMatchObject({
        slug: 'voltix-nova-12-pro',
        name: 'Voltix Nova 12 Pro',
        brand: 'Voltix',
        price: 399900,
      });
    });

    it('returns 404 for an unknown slug', async () => {
      await request(app.getHttpServer())
        .get('/api/products/does-not-exist')
        .expect(404);
    });

    it('is safe against SQL injection', async () => {
      await request(app.getHttpServer())
        .get(`/api/products/${encodeURIComponent("x' OR '1'='1")}`)
        .expect(404);
    });
  });

  it('returns 400 for an invalid query', async () => {
    await request(app.getHttpServer()).get('/api/products?q=a&q=b').expect(400);

    await request(app.getHttpServer())
      .get('/api/products')
      .query({ q: 'x'.repeat(101) })
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/products')
      .query({ unknown: 'param' })
      .expect(400);
  });
});
