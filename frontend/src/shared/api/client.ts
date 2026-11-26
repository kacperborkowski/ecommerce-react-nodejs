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

// NestJS errors look like { message: 'Product 3 not found' } or, for
// validation errors, { message: ['quantity must not be greater than 99'] }
async function readErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { message?: unknown }
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message
    return typeof message === 'string' ? message : undefined
  } catch {
    return undefined
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  params?: QueryParams
  body?: unknown
}

async function request<T>(path: string, { method = 'GET', params, body }: RequestOptions = {}) {
  const url = buildUrl(path, params)
  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  // fetch doesn't reject on HTTP errors (404, 500), so we have to check the status ourselves
  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new ApiError(
      response.status,
      message ?? `${method} ${url} failed with status ${response.status}`,
    )
  }

  // 204 No Content (e.g. logout) has no body to parse
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  return request<T>(path, { params })
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body })
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body })
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}
