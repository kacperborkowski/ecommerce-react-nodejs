import { z } from 'zod'

// The same rules as LoginDto and RegisterDto in the backend

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Enter a valid email address' }).max(254))

export const loginSchema = z.object({
  email,
  // Passwords are never trimmed: spaces are a valid part of a password
  password: z.string().min(1, 'Enter your password').max(128),
})

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name').max(100),
  lastName: z.string().trim().min(1, 'Enter your last name').max(100),
  email,
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .max(128, 'Use at most 128 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
