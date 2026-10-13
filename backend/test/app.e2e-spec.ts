import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';

describe('Products API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('GET /api/products returns the product list', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .expect(200);

    expect(response.body).toHaveLength(20);
    expect(response.body[0]).toMatchObject({
      id: '1',
      slug: 'voltix-nova-12',
      price: 249900,
    });
  });

  it('GET /api/products?q= filters products by name', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .query({ q: 'nova pro' })
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Voltix Nova 12 Pro');
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

  afterEach(async () => {
    await app.close();
  });
});
