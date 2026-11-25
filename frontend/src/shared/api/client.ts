export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type QueryValue = string | number | undefined

export type QueryParams = Record<string, QueryValue | QueryValue[]>

function buildUrl(path: string, params: QueryParams = {}): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    // Arrays become repeated params: { brand: ['A', 'B'] } → brand=A&brand=B
    const values = Array.isArray(value) ? value : [value]

    for (const item of values) {
      // Skip empty values, but keep 0 (e.g. maxPrice=0 is a valid filter)
      if (item !== undefined && item !== '') {
        searchParams.append(key, String(item))
      }
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
