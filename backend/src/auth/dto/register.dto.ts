import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NormalizeEmail, Trim } from '../../common/transforms.js';

// Body of POST /api/auth/register
export class RegisterDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email!: string;

  // Not trimmed: spaces are a valid part of a password. The upper limit stops
  // someone from sending megabytes of text to keep the server busy hashing.
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;
}
