import { ApiError } from '@/shared/api/client'

// The server's message for errors caused by the input ("Invalid email or
// password", "An account with this email already exists"); a general one for
// server and network failures, which the user can't fix
export function authErrorMessage(error: Error | null): string | undefined {
  if (!error) {
    return undefined
  }

  if (error instanceof ApiError && error.status < 500) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
