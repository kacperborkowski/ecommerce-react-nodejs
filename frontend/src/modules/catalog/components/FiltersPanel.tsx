import type { SubmitEvent } from 'react'
import {
  hasActiveFilters,
  type ProductFilters,
  type useProductFilters,
} from '../hooks/useProductFilters'
import {
  PRODUCT_CATEGORIES,
  type FacetValue,
  type ProductCategory,
  type ProductFacets,
} from '../types'
import styles from './FiltersPanel.module.css'

type FiltersPanelProps = {
  filters: ProductFilters
  // Undefined while the first facets are loading: options show without counts
  facets?: ProductFacets
  onChange: ReturnType<typeof useProductFilters>['updateFilters']
  onClear: () => void
}

const countOf = (facet: FacetValue[] | undefined, value: string) =>
  facet && (facet.find((item) => item.value === value)?.count ?? 0)

// Brands come from the database, so a new brand shows up without code changes.
// Selected brands stay on the list even when the other filters leave them
// with 0 products, so they can still be unchecked.
function brandOptions(facets: ProductFacets | undefined, selected: string[]): string[] {
  const brands = new Set([...(facets?.brands.map((item) => item.value) ?? []), ...selected])
  return [...brands].sort()
}

const PLN = (grosze: number | null | undefined, round: (value: number) => number) =>
  grosze == null ? undefined : round(grosze / 100)

export function FiltersPanel({ filters, facets, onChange, onClear }: FiltersPanelProps) {
  const allCategoriesCount = facets?.categories.reduce((sum, item) => sum + item.count, 0)
  const minPricePlaceholder = PLN(facets?.price.min, Math.floor)
  const maxPricePlaceholder = PLN(facets?.price.max, Math.ceil)

  // Computed from the current filters at the moment of the change,
  // so quickly checking two brands keeps both
  const toggleBrand = (brand: string) => {
    onChange((current) => ({
      brand: current.brand.includes(brand)
        ? current.brand.filter((item) => item !== brand)
        : [...current.brand, brand],
    }))
  }

  // Prices are applied on submit (button or Enter), not on every keystroke,
  // so typing "1500" doesn't send requests for 1, 15 and 150
  const handlePriceSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const toPrice = (name: string) => {
      const value = String(formData.get(name) ?? '').trim()
      return value === '' ? undefined : Number(value)
    }

    onChange({ minPrice: toPrice('minPrice'), maxPrice: toPrice('maxPrice') })
  }

  return (
    <div className={styles.panel}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Category</legend>
        {[undefined, ...PRODUCT_CATEGORIES].map((category: ProductCategory | undefined) => {
          const count = category ? countOf(facets?.categories, category) : allCategoriesCount
          const checked = filters.category === category

          return (
            <label key={category ?? 'all'} className={styles.option}>
              <input
                type="radio"
                name="category"
                checked={checked}
                // An empty category can't be chosen, unless it's already selected
                disabled={count === 0 && !checked}
                onChange={() => onChange({ category })}
              />
              <span className={styles.optionLabel}>{category ?? 'All categories'}</span>
              <Count value={count} />
            </label>
          )
        })}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Brand</legend>
        {brandOptions(facets, filters.brand).map((brand) => {
          const count = countOf(facets?.brands, brand)
          const checked = filters.brand.includes(brand)

          return (
            <label key={brand} className={styles.option}>
              <input
                type="checkbox"
                checked={checked}
                disabled={count === 0 && !checked}
                onChange={() => toggleBrand(brand)}
              />
              {brand}
              <Count value={count} />
            </label>
          )
        })}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Price (PLN)</legend>
        <form
          // Remount when the URL changes (e.g. "Clear filters" or back button),
          // so the inputs always show the prices from the URL
          key={`${filters.minPrice}-${filters.maxPrice}`}
          className={styles.priceForm}
          onSubmit={handlePriceSubmit}
        >
          <input
            className={styles.priceInput}
            type="number"
            name="minPrice"
            min={0}
            // Show the cheapest matching price as a hint, e.g. "From 149"
            placeholder={minPricePlaceholder === undefined ? 'From' : `${minPricePlaceholder}`}
            aria-label="Minimum price in PLN"
            defaultValue={filters.minPrice}
          />
          <span aria-hidden="true">–</span>
          <input
            className={styles.priceInput}
            type="number"
            name="maxPrice"
            min={0}
            placeholder={maxPricePlaceholder === undefined ? 'To' : `${maxPricePlaceholder}`}
            aria-label="Maximum price in PLN"
            defaultValue={filters.maxPrice}
          />
          <button className={styles.applyButton} type="submit">
            Apply
          </button>
        </form>
      </fieldset>

      {hasActiveFilters(filters) && (
        <button className={styles.clearButton} type="button" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  )
}

// Number of products for an option, e.g. "(6)". Nothing while counts are loading.
function Count({ value }: { value: number | undefined }) {
  if (value === undefined) return null

  return <span className={styles.count}>({value})</span>
}
