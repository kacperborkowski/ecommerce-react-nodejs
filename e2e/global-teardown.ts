import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { TEST_ACCOUNT_DOMAIN, TEST_EMAIL } from './tests/test-data'

// Runs once after all tests, also when some of them failed.
// Placing an order takes products out of stock, so here we put the ordered
// pieces back and delete the test orders and accounts. The database stays as
// it was.
export default async function globalTeardown() {
  // Same database as the backend uses (path relative to this file, so it
  // works no matter which folder the tests are started from)
  process.loadEnvFile(fileURLToPath(new URL('../backend/.env', import.meta.url)))
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    await client.query('BEGIN')
    // First add up the pieces per product. UPDATE ... FROM changes each
    // product row only once, so with several orders of the same product
    // joining order_items directly would give back only one of them.
    await client.query(
      `UPDATE products p
       SET stock = p.stock + ordered.quantity
       FROM (
         SELECT oi.product_id, sum(oi.quantity)::int AS quantity
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.email = $1
         GROUP BY oi.product_id
       ) AS ordered
       WHERE ordered.product_id = p.id`,
      [TEST_EMAIL],
    )
    await client.query('DELETE FROM orders WHERE email = $1', [TEST_EMAIL])
    // Their sessions go with them (ON DELETE CASCADE)
    await client.query('DELETE FROM users WHERE email LIKE $1', [`%${TEST_ACCOUNT_DOMAIN}`])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}
