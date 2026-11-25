import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pg, { QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  // A pool keeps a few open connections and reuses them between requests
  private readonly pool: pg.Pool;

  constructor(config: ConfigService) {
    this.pool = new pg.Pool({
      connectionString: config.getOrThrow<string>('DATABASE_URL'),
    });
  }

  // Fail fast on startup if the database is unreachable
  async onModuleInit(): Promise<void> {
    await this.pool.query('SELECT 1');
    this.logger.log('Connected to the database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  // Always pass user input through `params` ($1, $2, ...), never by
  // concatenating it into `text`. This prevents SQL injection.
  async query<T extends QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(text, params);
    return result.rows;
  }

  // Runs several queries as one transaction: either all of them are saved
  // (COMMIT), or none of them (ROLLBACK), e.g. when one throws an error.
  //
  // A transaction must use one connection from start to end, so we borrow a
  // single client from the pool instead of calling this.pool.query().
  async transaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await work({
        query: async <R extends QueryResultRow>(
          text: string,
          params: unknown[] = [],
        ) => (await client.query<R>(text, params)).rows,
      });
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Give the connection back to the pool, even after an error
      client.release();
    }
  }
}

// What the work function inside transaction() gets: the same query() as
// DatabaseService, but running on the transaction's connection
export interface Transaction {
  query<T extends QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<T[]>;
}
