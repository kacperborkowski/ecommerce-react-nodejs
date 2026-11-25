import { IsInt, IsOptional, Max, Min } from 'class-validator';

// Body of POST /api/cart/items, e.g. { "productId": 3, "quantity": 2 }
export class AddCartItemDto {
  @IsInt()
  @Min(1)
  productId!: number;

  // Optional: adding without a quantity adds one piece
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  quantity?: number;
}
