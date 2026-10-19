// Loads demo data into the database: node --env-file=.env db/seed.mjs
import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';

const seedsDir = new URL('./seeds/', import.meta.url);

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env first.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  const files = (await readdir(seedsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = await readFile(new URL(file, seedsDir), 'utf8');
    await client.query(sql);
    console.log(`Seeded: ${file}`);
  }
} finally {
  await client.end();
}
