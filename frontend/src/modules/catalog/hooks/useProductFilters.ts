import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SORTS,
  type ProductCategory,
  type ProductSort,
  type ProductsQuery,
} from '../types'

// Filters as they live in the URL, e.g.
// /search?q=watch&category=smartwatches&brand=Voltix&brand=Aurel&minPrice=1000&sort=price_asc
// Prices are in whole PLN, because people read and share these links.
export type ProductFilters = {
  q: string
  category?: ProductCategory
  brand: string[]
  minPrice?: number
  maxPrice?: number
  sort?: ProductSort
}

// The URL can be edited by hand, so unknown values are ignored instead of
// being sent to the API (which would answer with 400)
function oneOf<T extends string>(allowed: readonly T[], value: string | null): T | undefined {
  return allowed.find((item) => item === value)
}

function parsePrice(value: string | null): number | undefined {
  if (!value) return undefined
  const price = Number(value)
  return Number.isFinite(price) && price >= 0 ? price : undefined
}

function parseFilters(searchParams: URLSearchParams): ProductFilters {
  return {
    q: searchParams.get('q')?.trim() ?? '',
    category: oneOf(PRODUCT_CATEGORIES, searchParams.get('category')),
    brand: searchParams.getAll('brand'),
    minPrice: parsePrice(searchParams.get('minPrice')),
    maxPrice: parsePrice(searchParams.get('maxPrice')),
    sort: oneOf(PRODUCT_SORTS, searchParams.get('sort')),
  }
}

function toSearchParams(filters: ProductFilters): URLSearchParams {
  const searchParams = new URLSearchParams()

  if (filters.q) searchParams.set('q', filters.q)
  if (filters.category) searchParams.set('category', filters.category)
  for (const brand of filters.brand) searchParams.append('brand', brand)
  if (filters.minPrice !== undefined) searchParams.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== undefined) searchParams.set('maxPrice', String(filters.maxPrice))
  if (filters.sort) searchParams.set('sort', filters.sort)

  return searchParams
}

// True when any filter is set (the search phrase and sorting don't count)
export function hasActiveFilters(filters: ProductFilters): boolean {
  return Boolean(
    filters.category ||
      filters.brand.length ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined,
  )
}

const toGrosze =(pln: number | undefined) =>
  pln === undefined ? undefined : Math.round(pln * 100)

// Converts URL filters into API params (the API expects prices in grosze)
export function toProductsQuery(filters: ProductFilters): ProductsQuery {
  return {
    ...filters,
    minPrice: toGrosze(filters.minPrice),
    maxPrice: toGrosze(filters.maxPrice),
  }
}

// The URL is the single source of truth for filters: changing a filter
// changes the URL, and the page reads filters back from it. Thanks to that,
// links can be shared and the back button undoes the last change.
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])

  // The newest filters, including a change that the router hasn't rendered yet.
  // Without it, two quick clicks would both start from the same old URL and
  // the second one would undo the first.
  const latestFilters = useRef(filters)
  useEffect(() => {
    latestFilters.current = filters
  }, [filters])

  // Changes can be an object, or a function of the current filters
  const updateFilters = (
    changes: Partial<ProductFilters> | ((current: ProductFilters) => Partial<ProductFilters>),
  ) => {
    const current = latestFilters.current
    const next = { ...current, ...(typeof changes === 'function' ? changes(current) : changes) }

    latestFilters.current = next
    setSearchParams(toSearchParams(next))
  }

  // Keeps the search phrase and sorting, removes everything else
  const clearFilters = () => {
    updateFilters(({ q, sort }) => ({
      q,
      sort,
      category: undefined,
      brand: [],
      minPrice: undefined,
      maxPrice: undefined,
    }))
  }

  return { filters, updateFilters, clearFilters }
}
