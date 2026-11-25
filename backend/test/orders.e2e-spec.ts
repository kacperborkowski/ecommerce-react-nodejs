import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { DatabaseService } from './../src/database/database.service.js';

// Product ids from the seed (db/seeds/products.sql)
const NORDIA_X5 = 3; // price 189900
const VOLTIX_BEAT_GO = 13; // price 29900
const AUREL_WATCH_ULTRA = 18;
const TOUCHED_PRODUCTS = [NORDIA_X5, VOLTIX_BEAT_GO, AUREL_WATCH_ULTRA];

const TEST_EMAIL = 'e2e-orders@example.com';

// Runs against the database from .env (needs migrations and seed applied).
// Placing orders changes stock, so the tests put stock and prices back at the end.
describe('Orders API (e2e)', () => {
  let app: INestApplication<App>;
  let db: DatabaseService;
  let savedProducts: { id: number; stock: number; price: number }[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    db = app.get(DatabaseService);
    savedProducts = await db.query(
      'SELECT id, stock, price FROM products WHERE id = ANY($1)',
      [TOUCHED_PRODUCTS],
    );
  });

  afterAll(async () => {
    for (const { id, stock, price } of savedProducts) {
      await db.query(
        'UPDATE products SET stock = $2, price = $3 WHERE id = $1',
        [id, stock, price],
      );
    }
    await db.query('DELETE FROM orders WHERE email = $1', [TEST_EMAIL]);
    await app.close();
  });

  const stockOf = async (productId: number) => {
    const [row] = await db.query<{ stock: number }>(
      'SELECT stock FROM products WHERE id = $1',
      [productId],
    );
    return row.stock;
  };

  const orderBody = (overrides: Record<string, unknown> = {}) => ({
    idempotencyKey: randomUUID(),
    customer: {
      email: TEST_EMAIL,
      firstName: 'Jan',
      lastName: 'Kowalski',
      phone: '+48 600 100 200',
    },
    address: { street: 'Prosta 1', postalCode: '00-950', city: 'Warszawa' },
    deliveryMethod: 'parcel_locker',
    paymentMethod: 'blik',
    ...overrides,
  });

  // A shopper with a cart: an agent keeps the cart cookie like a browser
  const shopperWith = async (
    items: [productId: number, quantity: number][],
  ) => {
    const shopper = request.agent(app.getHttpServer());
    for (const [productId, quantity] of items) {
      await shopper
        .post('/api/cart/items')
        .send({ productId, quantity })
        .expect(201);
    }
    return shopper;
  };

  it('turns the cart into an order, takes stock and empties the cart', async () => {
    const stockBefore = [
      await stockOf(NORDIA_X5),
      await stockOf(VOLTIX_BEAT_GO),
    ];
    const shopper = await shopperWith([
      [NORDIA_X5, 2],
      [VOLTIX_BEAT_GO, 1],
    ]);

    const response = await shopper
      .post('/api/orders')
      .send(orderBody())
      .expect(201);

    expect(response.body).toMatchObject({
      status: 'placed',
      items: [
        {
          productId: NORDIA_X5,
          name: 'Nordia X5',
          unitPrice: 189900,
          quantity: 2,
        },
        { productId: VOLTIX_BEAT_GO, quantity: 1, lineTotal: 29900 },
      ],
      itemsTotal: 2 * 189900 + 29900,
      deliveryPrice: 999,
      total: 2 * 189900 + 29900 + 999,
    });
    expect(String(response.headers['set-cookie'])).toMatch(/^cartId=;/);

    expect(await stockOf(NORDIA_X5)).toBe(stockBefore[0] - 2);
    expect(await stockOf(VOLTIX_BEAT_GO)).toBe(stockBefore[1] - 1);

    const cart = await shopper.get('/api/cart').expect(200);
    expect(cart.body).toMatchObject({ items: [], totalQuantity: 0 });
  });

  it('returns the same order when the request is repeated (idempotency)', async () => {
    const shopper = await shopperWith([[VOLTIX_BEAT_GO, 1]]);
    const body = orderBody();

    const first = await shopper.post('/api/orders').send(body).expect(201);
    const stockAfterFirst = await stockOf(VOLTIX_BEAT_GO);

    const second = await shopper.post('/api/orders').send(body).expect(200);

    expect((second.body as { id: string }).id).toBe(
      (first.body as { id: string }).id,
    );
    expect(await stockOf(VOLTIX_BEAT_GO)).toBe(stockAfterFirst);
  });

  it('keeps the price from the moment of the order', async () => {
    const shopper = await shopperWith([[VOLTIX_BEAT_GO, 1]]);
    const placed = await shopper
      .post('/api/orders')
      .send(orderBody())
      .expect(201);
    const { id } = placed.body as { id: string };

    await db.query('UPDATE products SET price = 99900 WHERE id = $1', [
      VOLTIX_BEAT_GO,
    ]);

    const order = await request(app.getHttpServer())
      .get(`/api/orders/${id}`)
      .expect(200);
    expect(order.body).toMatchObject({
      items: [{ unitPrice: 29900 }],
      itemsTotal: 29900,
    });
  });

  it('refuses the order and changes nothing when stock ran out', async () => {
    const shopper = await shopperWith([[AUREL_WATCH_ULTRA, 2]]);
    // Someone else bought the watches in the meantime
    await db.query('UPDATE products SET stock = 1 WHERE id = $1', [
      AUREL_WATCH_ULTRA,
    ]);

    const response = await shopper
      .post('/api/orders')
      .send(orderBody())
      .expect(409);
    expect((response.body as { message: string }).message).toContain(
      'Aurel Watch Ultra',
    );

    // The transaction was rolled back: stock untouched, cart still there
    expect(await stockOf(AUREL_WATCH_ULTRA)).toBe(1);
    const cart = await shopper.get('/api/cart');
    expect(cart.body).toMatchObject({ totalQuantity: 2 });
  });

  it('returns 400 for an empty cart', async () => {
    await request(app.getHttpServer())
      .post('/api/orders')
      .send(orderBody())
      .expect(400);
  });

  it('returns 400 for invalid customer data or methods', async () => {
    const shopper = await shopperWith([[VOLTIX_BEAT_GO, 1]]);

    for (const body of [
      orderBody({ idempotencyKey: 'not-a-uuid' }),
      orderBody({ customer: { email: 'not-an-email' } }),
      orderBody({
        address: { street: 'Prosta 1', postalCode: '00950', city: 'Warszawa' },
      }),
      orderBody({ deliveryMethod: 'drone' }),
      orderBody({ paymentMethod: 'crypto' }),
      orderBody({ total: 1 }),
    ]) {
      await shopper.post('/api/orders').send(body).expect(400);
    }
  });

  it('returns 404 for an unknown order and 400 for an invalid id', async () => {
    await request(app.getHttpServer())
      .get(`/api/orders/${randomUUID()}`)
      .expect(404);
    await request(app.getHttpServer()).get('/api/orders/123').expect(400);
  });

  it('lists delivery and payment methods with prices', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/checkout/options')
      .expect(200);

    expect(response.body).toMatchObject({
      deliveryMethods: expect.arrayContaining([
        { id: 'courier', label: 'Courier', price: 1499 },
      ]) as unknown,
      paymentMethods: expect.arrayContaining([
        { id: 'blik', label: 'BLIK' },
      ]) as unknown,
    });
  });
});
