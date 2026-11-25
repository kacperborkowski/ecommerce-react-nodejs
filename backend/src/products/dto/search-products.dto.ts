import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PRODUCT_CATEGORIES } from '../product.interface.js';
import type { ProductCategory } from '../product.interface.js';

// Describes and validates the query string of GET /api/products, e.g.
// ?q=nova&category=smartphones&brand=Voltix&brand=Aurel&minPrice=100000
export class SearchProductsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(PRODUCT_CATEGORIES)
  category?: ProductCategory;

  // ?brand=Voltix gives a string, ?brand=Voltix&brand=Aurel gives an array.
  // Always turn it into an array, so the service handles one case.
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value : [value],
  )
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  brand?: string[];

  // Query string values are always text. @Type converts "100000" to 100000.
  // Prices are in grosze, like everywhere else in the API.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;
}
