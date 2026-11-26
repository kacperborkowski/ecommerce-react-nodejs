// A user as returned by the API. The password hash never leaves the backend.
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

// Body of GET /api/auth/me: null for a guest
export interface CurrentUserResponse {
  user: User | null;
}
