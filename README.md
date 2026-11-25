# E-commerce shop (React + NestJS + PostgreSQL)

A simple online shop built as a portfolio project: a home page with featured products, product search and a results page. Product page, filters and sorting, cart and checkout are next on the list.

The project runs locally only. Clone it, start the database in Docker and run the frontend and backend with a few commands.

## Tech stack

| Part | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, CSS Modules |
| Backend | Node.js 22, NestJS, class-validator |
| Database | PostgreSQL 18 in Docker, plain SQL with [`pg`](https://node-postgres.com), migrations with [dbmate](https://github.com/amacneil/dbmate) |
| Tests | Vitest, supertest (backend unit and end-to-end tests) |

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
| `npm run db:migrate` | runs pending migrations |
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

## Project structure

```
├── docker-compose.yml        # PostgreSQL for local development
├── backend/                  # NestJS API
│   ├── db/migrations/        # SQL migrations (dbmate)
│   ├── db/seeds/             # demo data
│   ├── src/database/         # connection pool shared by all modules
│   ├── src/products/         # products module: controller, service, DTOs
│   └── test/                 # end-to-end tests
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
- **Prices in the smallest currency unit** (grosze, integers), so there are no floating-point rounding errors.
- **Search state lives in the URL** (`/search?q=...`). Links can be shared, and the back button and page refresh work.
- **Built-in `fetch` instead of axios**, wrapped in a small typed `apiGet` client. TanStack Query takes care of caching, loading and error states.
- **No passwords in the repository.** Credentials live in `.env` files ignored by git; `.env.example` files show the format.
