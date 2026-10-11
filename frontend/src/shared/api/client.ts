export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { Accept: 'application/json' },
  })

  // fetch doesn't reject on HTTP errors (404, 500), so we have to check the status ourselves
  if (!response.ok) {
    throw new ApiError(response.status, `GET ${path} failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
