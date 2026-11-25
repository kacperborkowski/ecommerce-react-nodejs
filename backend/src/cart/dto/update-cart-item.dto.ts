import { IsInt, Max, Min } from 'class-validator';

// Body of PATCH /api/cart/items/:productId, e.g. { "quantity": 3 }.
// To remove an item, use DELETE instead of setting the quantity to 0.
export class UpdateCartItemDto {
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
