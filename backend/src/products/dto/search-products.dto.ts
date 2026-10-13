import { IsOptional, IsString, MaxLength } from 'class-validator';

// Describes and validates the query string of GET /api/products
export class SearchProductsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
