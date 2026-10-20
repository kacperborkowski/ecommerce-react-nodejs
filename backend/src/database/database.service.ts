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
}
