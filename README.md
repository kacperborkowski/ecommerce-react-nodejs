# E-commerce shop (React + NestJS + PostgreSQL)

[![CI](https://github.com/kacperborkowski/ecommerce-react-nodejs/actions/workflows/ci.yml/badge.svg)](https://github.com/kacperborkowski/ecommerce-react-nodejs/actions/workflows/ci.yml)

A simple online shop built as a portfolio project. It covers the whole shopping path:

- home page with featured products,
- product search with filters (category, brand, price), facet counts and sorting,
- product page,
- guest cart kept in a cookie,
- user accounts: registration, sign-in and logout,
- checkout with delivery and payment methods, and an order confirmation page.

The project runs locally only. Clone it, start the database in Docker and run the frontend and backend with a few commands.

## Tech stack

| Part | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod, CSS Modules |
| Backend | Node.js 22, NestJS, class-validator |
| Database | PostgreSQL 18 in Docker, plain SQL with [`pg`](https://node-postgres.com), migrations with [dbmate](https://github.com/amacneil/dbmate) |
| Tests | Vitest, supertest (backend unit and API tests), Playwright (end-to-end tests in a browser) |

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the database)
- Node.js 22. With [nvm](https://github.com/nvm-sh/nvm), run `nvm use` in the project folder; the version is set in `.nvmrc`.

## Getting started

### 1. Start the database

In the project root, create the `.env` file and set your own password in `POSTGRES_PASSWORD`:

```bash
cp -n .env.example .env
```

`-n` never overwrites an existing `.env`. This matters: PostgreSQL reads the password only when the database is created for the first time, so changing it later breaks the connection.

Start PostgreSQL in the background:

```bash
docker compose up -d
```

### 2. Run the backend

In the `backend` folder, create the `.env` file. In `DATABASE_URL`, use the same password as in the root `.env`:

```bash
cd backend
cp -n .env.example .env
```

If the backend fails with `password authentication failed for user "shop"`, the passwords in the two `.env` files do not match.

Install dependencies, create the tables and load the demo products:

```bash
npm install
npm run db:migrate
npm run db:seed
```

Start the API on http://localhost:3000:

```bash
npm run start:dev
```

### 3. Run the frontend

In a second terminal, in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. During development Vite forwards `/api` requests to the backend.

## End-to-end tests (Playwright)

The tests in `e2e/` click through the shop in a real browser: search with filters and sorting, the whole purchase from the search bar to the order confirmation, and registration with signing in and out.

The database must be running with migrations and seed applied. Playwright starts the backend and the frontend by itself, or uses them if they're already running. Orders and accounts created by the tests are removed at the end (stock is given back).

First time only, in the `e2e` folder:

```bash
npm install
npx playwright install chromium
```

Run the tests:

```bash
npm test
```

`npm run test:ui` opens Playwright's interactive mode, where you can watch each step. After a failure, `npm run report` shows what happened.

## Data persistence

The database files are kept in the Docker volume `db-data`, so your data survives restarts of the app, `docker compose down` and computer restarts.

To start over with an empty database (this deletes all data):

```bash
docker compose down -v
```

Then run `npm run db:migrate` and `npm run db:seed` in `backend` again.

## Useful commands

Backend (`backend` folder):

| Command | What it does |
|---|---|
| `npm run start:dev` | starts the API and restarts it on file changes |
| `npm test` | unit tests |
| `npm run test:e2e` | end-to-end tests of the API (the database must be running) |
| `npm run lint` | linter |
| `npm run db:new -- name` | creates a new migration file |
| `npm run db:migrate` | runs pending migrations (run it after every `git pull` that adds a migration) |
| `npm run db:rollback` | rolls back the last migration |
| `npm run db:status` | shows applied and pending migrations |
| `npm run db:seed` | loads the demo products (safe to run again) |

Frontend (`frontend` folder):

| Command | What it does |
|---|---|
| `npm run dev` | starts the dev server |
| `npm run build` | type-checks and builds the production bundle |
| `npm run lint` | linter |

Database console (project root):

```bash
docker compose exec db psql -U shop -d shop
```

Use the user and database names from your root `.env` if you changed them.

## API

| Endpoint | Description |
|---|---|
| `GET /api/products` | all products |
| `GET /api/products?q=nova pro` | products whose name contains every word of the query (case-insensitive) |
| `GET /api/products?category=laptops` | filter by category: `smartphones`, `laptops`, `headphones`, `smartwatches` |
| `GET /api/products?brand=Voltix&brand=Aurel` | filter by one or more brands |
| `GET /api/products?minPrice=100000&maxPrice=200000` | filter by price range in grosze (limits included) |
| `GET /api/products?sort=price_asc` | sort by `price_asc`, `price_desc` or `name_asc` |

All parameters can be combined, e.g. `?q=watch&brand=Aurel&sort=price_desc`. Invalid values return `400`.

| Endpoint | Description |
|---|---|
| `GET /api/products/facets` | options for the filters panel: categories and brands with product counts, and the price range. Accepts the same filters as `/api/products`; each facet ignores its own filter, so selecting one brand still shows counts for the others |
| `GET /api/products/:slug` | a single product, e.g. `/api/products/voltix-nova-12`; `404` if it does not exist |

### Cart

The guest cart is identified by an `httpOnly` cookie `cartId` (a random UUID), set on the first `POST /api/cart/items`. Every cart endpoint returns the whole cart with totals calculated on the server.

| Endpoint | Description |
|---|---|
| `GET /api/cart` | the current cart; an empty cart if there is no cookie yet |
| `POST /api/cart/items` | add a product: `{ "productId": 3, "quantity": 1 }` (quantity is optional); adding the same product again increases its quantity |
| `PATCH /api/cart/items/:productId` | set the quantity: `{ "quantity": 2 }` |
| `DELETE /api/cart/items/:productId` | remove a product from the cart |

Quantities are limited to the product stock (and 99); going over returns `409`. A product that is not in the cart returns `404`.

### Checkout and orders

| Endpoint | Description |
|---|---|
| `GET /api/checkout/options` | delivery methods with prices and payment methods |
| `POST /api/orders` | turns the cart into an order (see below) |
| `GET /api/orders/:id` | an order, for the confirmation page; the id is a random UUID |

`POST /api/orders` body:

```json
{
  "idempotencyKey": "7f0c2c1e-3b9a-4d55-9c8e-2f1a6b0d4e11",
  "customer": { "email": "jan@example.com", "firstName": "Jan", "lastName": "Kowalski", "phone": "+48 600 100 200" },
  "address": { "street": "Prosta 1", "postalCode": "00-950", "city": "Warszawa" },
  "deliveryMethod": "courier",
  "paymentMethod": "blik"
}
```

Placing an order runs in one database transaction: it locks the products, checks the stock, saves the order with the current prices, takes the pieces out of stock and deletes the cart. If anything fails, nothing is saved. Sending the same `idempotencyKey` again returns the existing order (`200`) instead of creating a second one. Payment is not processed: the order is saved with the chosen method and status `placed`.

### Accounts

A logged-in browser is identified by an `httpOnly` cookie `sessionId` (a random token, valid for 30 days).

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | create an account and log in: `{ "email": "jan@example.com", "password": "at least 8 characters", "firstName": "Jan", "lastName": "Kowalski" }`; `409` if the email is taken |
| `POST /api/auth/login` | log in: `{ "email": "...", "password": "..." }`; `401` with the same message for an unknown email and a wrong password |
| `POST /api/auth/logout` | log out (`204`); the session is deleted on the server, so the old cookie stops working |
| `GET /api/auth/me` | the logged-in user, or `{ "user": null }` for a guest |

Emails are saved in lower case, so `Jan@Example.com` and `jan@example.com` are one account.

## Project structure

```
├── docker-compose.yml        # PostgreSQL for local development
├── backend/                  # NestJS API
│   ├── db/migrations/        # SQL migrations (dbmate)
│   ├── db/seeds/             # demo data
│   ├── public/images/        # product illustrations (SVG), served at /images
│   ├── src/database/         # connection pool and transactions
│   ├── src/products/         # products: list, search, filters, facets
│   ├── src/cart/             # guest cart
│   ├── src/orders/           # checkout options and orders
│   ├── src/auth/             # registration, login, sessions
│   └── test/                 # API tests against the database
├── e2e/                      # Playwright tests of the whole shop in a browser
└── frontend/                 # React app
    └── src/
        ├── app/              # router, providers, root layout
        ├── pages/            # one folder per route, built from modules
        ├── modules/          # business areas: catalog, search, layout...
        └── shared/           # API client and helpers used everywhere
```

Each frontend module exposes its public API through `index.ts`. Pages import from modules, never the other way round.

## Design decisions

- **Plain SQL instead of an ORM.** Queries are written by hand with parameters (`$1`), which protects against SQL injection. Migrations are plain SQL files.
- **Images stored as files, the database keeps only their address** (`image_url`). The backend serves them from `backend/public/images`; in a bigger shop the same column would point to a CDN or object storage. The product illustrations are simple SVGs made for this project (the brands are fictional).
- **Sessions in the database instead of JWT.** The cookie holds a random token and the database keeps its SHA-256 hash, so logging out really ends the session on the server. Passwords are hashed with scrypt (built into Node.js) with a random salt per password.
- **Prices in the smallest currency unit** (grosze, integers), so there are no floating-point rounding errors.
- **Search state lives in the URL** (`/search?q=...`). Links can be shared, and the back button and page refresh work.
- **Built-in `fetch` instead of axios**, wrapped in a small typed `apiGet` client. TanStack Query takes care of caching, loading and error states.
- **No passwords in the repository.** Credentials live in `.env` files ignored by git; `.env.example` files show the format.
