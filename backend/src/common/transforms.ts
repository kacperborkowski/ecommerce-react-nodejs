import { Transform } from 'class-transformer';

// Decorators for DTO fields that clean the value before validation runs

// Removes spaces around text, so "  Jan " is saved as "Jan" and "   " fails
// @IsNotEmpty
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

// Trims and lower-cases an email, so " Jan@Example.com" and "jan@example.com"
// are treated as the same address
export const NormalizeEmail = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
