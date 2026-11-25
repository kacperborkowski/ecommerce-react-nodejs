import { useState } from 'react'
import {
  FiltersPanel,
  hasActiveFilters,
  ProductGrid,
  SortSelect,
  toProductsQuery,
  useProductFilters,
  useProducts,
} from '@/modules/catalog'
import { pluralize } from '@/shared/lib/pluralize'
import styles from './SearchPage.module.css'

export function SearchPage() {
  const { filters, updateFilters, clearFilters } = useProductFilters()
  const { q: query } = filters
  const { data: products, isPending, isError } = useProducts(toProductsQuery(filters))
  // On small screens the filters are hidden behind a button
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filtersActive = hasActiveFilters(filters)

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>
            {query ? `Search results for “${query}”` : 'All products'}
          </h1>
          {products && (
            <p className={styles.count}>{pluralize(products.length, 'product', 'products')}</p>
          )}
        </div>
        <SortSelect value={filters.sort} onChange={(sort) => updateFilters({ sort })} />
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Filters">
          <button
            className={styles.filtersToggle}
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="filters-panel"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide filters' : 'Show filters'}
            {filtersActive && ' •'}
          </button>
          <div
            id="filters-panel"
            className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ''}`}
          >
            <FiltersPanel filters={filters} onChange={updateFilters} onClear={clearFilters} />
          </div>
        </aside>

        <section className={styles.results} aria-label="Products">
          {isPending && <p className={styles.status}>Searching…</p>}
          {isError && (
            <p className={styles.status} role="alert">
              Could not load search results. Please try again later.
            </p>
          )}
          {products?.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.status}>
                {filtersActive
                  ? 'No products match the selected filters.'
                  : `No products found for “${query}”. Check the spelling or try a different phrase.`}
              </p>
              {filtersActive && (
                <button className={styles.clearButton} type="button" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}
          {products && products.length > 0 && <ProductGrid products={products} />}
        </section>
      </div>
    </div>
  )
}
