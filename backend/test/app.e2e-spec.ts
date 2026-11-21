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
