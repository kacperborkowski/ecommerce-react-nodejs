import { apiGet, apiPost } from '@/shared/api/client'
import type { LoginRequest, RegisterRequest, User } from '../types'

// The session lives in an httpOnly cookie that JavaScript can't read. The
// browser sends it with every request, so the frontend only asks the server
// who is logged in.

export async function getCurrentUser(): Promise<User | null> {
  const { user } = await apiGet<{ user: User | null }>('/auth/me')
  return user
}

export function login(body: LoginRequest): Promise<User> {
  return apiPost<User>('/auth/login', body)
}

export function register(body: RegisterRequest): Promise<User> {
  return apiPost<User>('/auth/register', body)
}

export function logout(): Promise<void> {
  return apiPost<void>('/auth/logout')
}
