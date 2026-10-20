import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { SearchProductsDto } from './dto/search-products.dto.js';
import { Product } from './product.interface.js';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll({ q }: SearchProductsDto = {}): Promise<Product[]> {
    const words = this.toSearchWords(q);

    // One condition per word, so "nova pro" matches "Voltix Nova 12 Pro":
    // name ILIKE $1 AND name ILIKE $2
    const conditions = words.map((_, index) => `name ILIKE $${index + 1}`);
    const params = words.map((word) => `%${this.escapeLikePattern(word)}%`);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    return this.db.query<Product>(
      `SELECT id, slug, name, brand, category, description, price, stock
       FROM products
       ${where}
       ORDER BY id`,
      params,
    );
  }

  private toSearchWords(query = ''): string[] {
    return query.trim().split(/\s+/).filter(Boolean);
  }

  // In LIKE patterns % and _ are wildcards. Escape them, so searching for "100%"
  // looks for the "%" character instead of matching every product.
  private escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, '\\$&');
  }
}
