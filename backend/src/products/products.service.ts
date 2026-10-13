import { Injectable } from '@nestjs/common';
import { PRODUCTS } from './data/products.data.js';
import { SearchProductsDto } from './dto/search-products.dto.js';
import { Product } from './product.interface.js';

@Injectable()
export class ProductsService {
  findAll({ q }: SearchProductsDto = {}): Product[] {
    const words = this.toSearchWords(q);

    if (words.length === 0) {
      return PRODUCTS;
    }

    // Every word has to appear in the name, so "nova pro" matches "Voltix Nova 12 Pro"
    return PRODUCTS.filter((product) => {
      const name = product.name.toLowerCase();
      return words.every((word) => name.includes(word));
    });
  }

  private toSearchWords(query = ''): string[] {
    return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }
}
