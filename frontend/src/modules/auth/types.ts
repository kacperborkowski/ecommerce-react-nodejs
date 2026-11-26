export type User = {
  id: number
  email: string
  firstName: string
  lastName: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = LoginRequest & {
  firstName: string
  lastName: string
}
