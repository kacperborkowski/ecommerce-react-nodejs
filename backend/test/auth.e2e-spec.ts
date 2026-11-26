import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';
import { DatabaseService } from './../src/database/database.service.js';

// Every account created here uses this domain, so afterAll can delete them
const TEST_DOMAIN = '@auth-test.example';
const PASSWORD = 'correct horse battery';

// Runs against the database from .env (needs migrations applied)
describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;
  let db: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
    db = app.get(DatabaseService);
  });

  afterAll(async () => {
    // Sessions go with their users (ON DELETE CASCADE)
    await db.query('DELETE FROM users WHERE email LIKE $1', [
      `%${TEST_DOMAIN}`,
    ]);
    await app.close();
  });

  // An agent keeps cookies between requests, like a browser
  const newBrowser = () => request.agent(app.getHttpServer());
  const uniqueEmail = () => `user-${randomUUID()}${TEST_DOMAIN}`;

  const register = (
    browser: ReturnType<typeof newBrowser>,
    email = uniqueEmail(),
  ) =>
    browser
      .post('/api/auth/register')
      .send({
        email,
        password: PASSWORD,
        firstName: 'Jan',
        lastName: 'Kowalski',
      });

  it('says nobody is logged in without a cookie', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(200)
      .expect({ user: null });
  });

  it('registers a user, logs them in and never returns the password', async () => {
    const browser = newBrowser();
    const email = uniqueEmail();

    const response = await register(browser, email).expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      email,
      firstName: 'Jan',
      lastName: 'Kowalski',
    });

    const cookie = String(response.headers['set-cookie']);
    expect(cookie).toMatch(/^sessionId=[\w-]{43};/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');

    const me = await browser.get('/api/auth/me').expect(200);
    expect(me.body).toEqual({ user: response.body });
  });

  it('keeps only hashes of the password and the session token', async () => {
    const browser = newBrowser();
    const email = uniqueEmail();
    const response = await register(browser, email).expect(201);
    const token = /sessionId=([^;]+)/.exec(
      String(response.headers['set-cookie']),
    )?.[1];

    const [user] = await db.query<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE email = $1',
      [email],
    );
    expect(user.password_hash).toMatch(/^scrypt\$/);
    expect(user.password_hash).not.toContain(PASSWORD);

    const sessions = await db.query(
      'SELECT 1 FROM sessions WHERE token_hash = $1',
      [token],
    );
    expect(sessions).toHaveLength(0);
  });

  it('saves the email in lower case and trims the names', async () => {
    const email = uniqueEmail();

    const response = await newBrowser()
      .post('/api/auth/register')
      .send({
        email: `  ${email.toUpperCase()} `,
        password: PASSWORD,
        firstName: '  Anna ',
        lastName: ' Nowak  ',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      email,
      firstName: 'Anna',
      lastName: 'Nowak',
    });
  });

  it('refuses a second account with the same email, in any letter case', async () => {
    const email = uniqueEmail();
    await register(newBrowser(), email).expect(201);

    const response = await register(newBrowser(), email.toUpperCase()).expect(
      409,
    );
    expect(response.body.message).toBe(
      'An account with this email already exists',
    );
  });

  it('validates the registration form', async () => {
    const response = await newBrowser()
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short', firstName: ' ' })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'email must be an email',
        'password must be longer than or equal to 8 characters',
        'firstName should not be empty',
        'lastName should not be empty',
      ]),
    );
  });

  it('logs in with the right password', async () => {
    const email = uniqueEmail();
    await register(newBrowser(), email).expect(201);
    const browser = newBrowser();

    const response = await browser
      .post('/api/auth/login')
      .send({ email: email.toUpperCase(), password: PASSWORD })
      .expect(200);

    expect(response.body).toMatchObject({ email, firstName: 'Jan' });
    const me = await browser.get('/api/auth/me').expect(200);
    expect(me.body.user).toMatchObject({ email });
  });

  it('gives the same answer for a wrong password and an unknown email', async () => {
    const email = uniqueEmail();
    await register(newBrowser(), email).expect(201);

    const wrongPassword = await newBrowser()
      .post('/api/auth/login')
      .send({ email, password: 'wrong password' })
      .expect(401);
    const unknownEmail = await newBrowser()
      .post('/api/auth/login')
      .send({ email: uniqueEmail(), password: PASSWORD })
      .expect(401);

    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(wrongPassword.body.message).toBe('Invalid email or password');
    expect(wrongPassword.headers['set-cookie']).toBeUndefined();
  });

  it('logs out: the session stops working even if the old cookie is sent again', async () => {
    const browser = newBrowser();
    const response = await register(browser).expect(201);
    const oldCookie = String(response.headers['set-cookie']).split(';')[0];

    const logout = await browser.post('/api/auth/logout').expect(204);
    expect(String(logout.headers['set-cookie'])).toMatch(/^sessionId=;/);

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', oldCookie)
      .expect(200)
      .expect({ user: null });
  });

  it('replaces the previous session on login', async () => {
    const email = uniqueEmail();
    const browser = newBrowser();
    const first = await register(browser, email).expect(201);
    const firstCookie = String(first.headers['set-cookie']).split(';')[0];

    const second = await browser
      .post('/api/auth/login')
      .send({ email, password: PASSWORD })
      .expect(200);

    expect(String(second.headers['set-cookie']).split(';')[0]).not.toBe(
      firstCookie,
    );
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', firstCookie)
      .expect({ user: null });
  });

  it('ignores an expired session', async () => {
    const browser = newBrowser();
    const response = await register(browser).expect(201);

    await db.query(
      `UPDATE sessions SET expires_at = now() - interval '1 second'
       WHERE user_id = $1`,
      [response.body.id],
    );

    await browser.get('/api/auth/me').expect(200).expect({ user: null });
  });

  it('ignores a made-up session cookie', async () => {
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', 'sessionId=made-up-token')
      .expect(200)
      .expect({ user: null });
  });
});
