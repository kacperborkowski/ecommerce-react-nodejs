import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';

// Product ids from the seed (db/seeds/products.sql)
const NORDIA_X5 = 3; // stock 22
const AUREL_FOLD_2 = 5; // stock 0
const AUREL_WATCH_ULTRA = 18; // stock 4, price 379900

// Runs against the database from .env (needs migrations and seed applied)
describe('Cart API (e2e)', () => {
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

  // An agent keeps cookies between requests, like a browser.
  // Each test gets its own agent, so its own cart.
  const newShopper = () => request.agent(app.getHttpServer());

  it('returns an empty cart without a cookie, without creating one', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/cart')
      .expect(200);

    expect(response.body).toEqual({ items: [], totalQuantity: 0, subtotal: 0 });
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('ignores a cart cookie that is not a UUID', async () => {
    await request(app.getHttpServer())
      .get('/api/cart')
      .set('Cookie', 'cartId=not-a-uuid')
      .expect(200)
      .expect({ items: [], totalQuantity: 0, subtotal: 0 });
  });

  it('creates a cart and sets an httpOnly cookie on the first add', async () => {
    const response = await newShopper()
      .post('/api/cart/items')
      .send({ productId: AUREL_WATCH_ULTRA })
      .expect(201);

    expect(response.body).toMatchObject({
      items: [
        {
          productId: AUREL_WATCH_ULTRA,
          name: 'Aurel Watch Ultra',
          quantity: 1,
          lineTotal: 379900,
        },
      ],
      totalQuantity: 1,
      subtotal: 379900,
    });

    const cookie = String(response.headers['set-cookie']);
    expect(cookie).toMatch(/^cartId=[0-9a-f-]{36};/);
    expect(cookie).toContain('HttpOnly');
  });

  it('remembers the cart and adds to the quantity of the same product', async () => {
    const shopper = newShopper();
    await shopper.post('/api/cart/items').send({ productId: NORDIA_X5 });
    await shopper
      .post('/api/cart/items')
      .send({ productId: AUREL_WATCH_ULTRA, quantity: 2 });
    await shopper
      .post('/api/cart/items')
      .send({ productId: NORDIA_X5, quantity: 2 });

    const response = await shopper.get('/api/cart').expect(200);

    expect(
      (response.body as { items: { productId: number; quantity: number }[] })
        .items,
    ).toEqual([
      expect.objectContaining({ productId: NORDIA_X5, quantity: 3 }),
      expect.objectContaining({ productId: AUREL_WATCH_ULTRA, quantity: 2 }),
    ]);
    expect(response.body).toMatchObject({
      totalQuantity: 5,
      subtotal: 3 * 189900 + 2 * 379900,
    });
  });

  it('does not allow more than the stock', async () => {
    const shopper = newShopper();
    await shopper
      .post('/api/cart/items')
      .send({ productId: AUREL_WATCH_ULTRA, quantity: 3 })
      .expect(201);

    await shopper
      .post('/api/cart/items')
      .send({ productId: AUREL_WATCH_ULTRA, quantity: 2 })
      .expect(409);

    const response = await shopper.get('/api/cart');
    expect(response.body).toMatchObject({ totalQuantity: 3 });
  });

  it('rejects out of stock and unknown products without creating a cart', async () => {
    const outOfStock = await request(app.getHttpServer())
      .post('/api/cart/items')
      .send({ productId: AUREL_FOLD_2 })
      .expect(409);
    expect(outOfStock.headers['set-cookie']).toBeUndefined();

    await request(app.getHttpServer())
      .post('/api/cart/items')
      .send({ productId: 999999 })
      .expect(404);
  });

  describe('changing items', () => {
    it('sets the quantity of an item', async () => {
      const shopper = newShopper();
      await shopper.post('/api/cart/items').send({ productId: NORDIA_X5 });

      const response = await shopper
        .patch(`/api/cart/items/${NORDIA_X5}`)
        .send({ quantity: 5 })
        .expect(200);

      expect(response.body).toMatchObject({
        totalQuantity: 5,
        subtotal: 5 * 189900,
      });
    });

    it('does not set a quantity above the stock', async () => {
      const shopper = newShopper();
      await shopper
        .post('/api/cart/items')
        .send({ productId: AUREL_WATCH_ULTRA });

      await shopper
        .patch(`/api/cart/items/${AUREL_WATCH_ULTRA}`)
        .send({ quantity: 5 })
        .expect(409);
    });

    it('removes an item', async () => {
      const shopper = newShopper();
      await shopper.post('/api/cart/items').send({ productId: NORDIA_X5 });
      await shopper
        .post('/api/cart/items')
        .send({ productId: AUREL_WATCH_ULTRA });

      const response = await shopper
        .delete(`/api/cart/items/${NORDIA_X5}`)
        .expect(200);

      expect(response.body).toMatchObject({
        items: [{ productId: AUREL_WATCH_ULTRA }],
        totalQuantity: 1,
      });
    });

    it('returns 404 for a product that is not in the cart', async () => {
      const shopper = newShopper();
      await shopper.post('/api/cart/items').send({ productId: NORDIA_X5 });

      await shopper
        .patch(`/api/cart/items/${AUREL_WATCH_ULTRA}`)
        .send({ quantity: 1 })
        .expect(404);
      await shopper.delete(`/api/cart/items/${AUREL_WATCH_ULTRA}`).expect(404);
    });

    it('returns 404 without a cart cookie', async () => {
      await request(app.getHttpServer())
        .delete(`/api/cart/items/${NORDIA_X5}`)
        .expect(404);
    });

    it('returns 400 for an invalid product id or quantity', async () => {
      await request(app.getHttpServer())
        .delete('/api/cart/items/abc')
        .expect(400);
      await request(app.getHttpServer())
        .patch(`/api/cart/items/${NORDIA_X5}`)
        .send({ quantity: 0 })
        .expect(400);
    });
  });

  it('returns 400 for an invalid body', async () => {
    for (const body of [
      {},
      { productId: 'abc' },
      { productId: 1, quantity: 0 },
      { productId: 1, quantity: 100 },
      { productId: 1, price: 1 },
    ]) {
      await request(app.getHttpServer())
        .post('/api/cart/items')
        .send(body)
        .expect(400);
    }
  });
});
