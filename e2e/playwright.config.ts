import { defineConfig, devices } from '@playwright/test'

// End-to-end tests of the whole shop in a real browser:
// frontend (Vite) → backend (NestJS) → database (PostgreSQL in Docker).
// The database must be running (docker compose up -d) with migrations and seed applied.
export default defineConfig({
  testDir: './tests',
  // Tests share one database (orders change stock), so run them one by one
  fullyParallel: false,
  workers: 1,
  // A failed test is retried once in CI, where machines are slower
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Undoes the orders placed by the tests (see global-teardown.ts)
  globalTeardown: './global-teardown.ts',

  use: {
    baseURL: 'http://localhost:5173',
    // Keep a trace (screenshots, network, console) of a failed test,
    // to view it with: npx playwright show-trace <file>
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  // Starts the backend and the frontend before the tests. If they're already
  // running (e.g. you're developing), the running ones are used.
  webServer: [
    {
      command: 'npm run start:dev',
      cwd: '../backend',
      url: 'http://localhost:3000/api/products',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
})
