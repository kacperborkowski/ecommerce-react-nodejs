export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type QueryParams = Record<string, string | undefined>

function buildUrl(path: string, params: QueryParams = {}): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value)
    }
  }

  const queryString = searchParams.toString()
  return `/api${path}${queryString ? `?${queryString}` : ''}`
}

export async function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  const url = buildUrl(path, params)
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  // fetch doesn't reject on HTTP errors (404, 500), so we have to check the status ourselves
  if (!response.ok) {
    throw new ApiError(response.status, `GET ${url} failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
