import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { SearchProductsDto } from './dto/search-products.dto.js';
import { Product, ProductSort } from './product.interface.js';

// Columns returned to the API. Shared by all queries, so every endpoint
// returns products in the same shape.
const PRODUCT_COLUMNS =
  'id, slug, name, brand, category, description, price, stock';

// ORDER BY can't use $1 parameters (they only work for values, not column
// names), so each allowed sort maps to a fixed piece of SQL written by us.
// `id` at the end keeps the order stable when two products have equal prices.
const ORDER_BY: Record<ProductSort | 'default', string> = {
  default: 'id',
  price_asc: 'price ASC, id',
  price_desc: 'price DESC, id',
  name_asc: 'name ASC, id',
};

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(filters: SearchProductsDto = {}): Promise<Product[]> {
    const { conditions, params } = this.buildFilters(filters);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderBy = ORDER_BY[filters.sort ?? 'default'];

    return this.db.query<Product>(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products
       ${where}
       ORDER BY ${orderBy}`,
      params,
    );
  }

  // Turns the filters into SQL conditions joined with AND. User input never
  // goes into the SQL text: each value is added to `params` and referenced
  // by its number ($1, $2, ...).
  private buildFilters({
    q,
    category,
    brand,
    minPrice,
    maxPrice,
  }: SearchProductsDto): { conditions: string[]; params: unknown[] } {
    const conditions: string[] = [];
    const params: unknown[] = [];

    // Adds the value to params and returns its placeholder, e.g. "$3"
    const param = (value: unknown): string => {
      params.push(value);
      return `$${params.length}`;
    };

    // One condition per word, so "nova pro" matches "Voltix Nova 12 Pro"
    for (const word of this.toSearchWords(q)) {
      const pattern = `%${this.escapeLikePattern(word)}%`;
      conditions.push(`name ILIKE ${param(pattern)}`);
    }

    if (category) {
      conditions.push(`category = ${param(category)}`);
    }

    // brand = ANY($1) checks if the brand is one of the values in the array,
    // like brand IN ('Voltix', 'Aurel')
    if (brand?.length) {
      conditions.push(`brand = ANY(${param(brand)})`);
    }

    if (minPrice !== undefined) {
      conditions.push(`price >= ${param(minPrice)}`);
    }

    if (maxPrice !== undefined) {
      conditions.push(`price <= ${param(maxPrice)}`);
    }

    return { conditions, params };
  }

  async findBySlug(slug: string): Promise<Product> {
    const [product] = await this.db.query<Product>(
      `SELECT ${PRODUCT_COLUMNS}
       FROM products
       WHERE slug = $1`,
      [slug],
    );

    // Nest turns this exception into a 404 Not Found response
    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    return product;
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
