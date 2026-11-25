import type { FormEvent } from 'react'
import {
  hasActiveFilters,
  type ProductFilters,
  type useProductFilters,
} from '../hooks/useProductFilters'
import { PRODUCT_CATEGORIES, type ProductCategory } from '../types'
import styles from './FiltersPanel.module.css'

// Temporary: will come from the backend (facets with product counts)
const BRANDS = ['Aurel', 'Nordia', 'Pixon', 'Voltix']

type FiltersPanelProps = {
  filters: ProductFilters
  onChange: ReturnType<typeof useProductFilters>['updateFilters']
  onClear: () => void
}

export function FiltersPanel({ filters, onChange, onClear }: FiltersPanelProps) {
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
  const handlePriceSubmit = (event: FormEvent<HTMLFormElement>) => {
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
        {[undefined, ...PRODUCT_CATEGORIES].map((category: ProductCategory | undefined) => (
          <label key={category ?? 'all'} className={styles.option}>
            <input
              type="radio"
              name="category"
              checked={filters.category === category}
              onChange={() => onChange({ category })}
            />
            <span className={styles.optionLabel}>{category ?? 'All categories'}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Brand</legend>
        {BRANDS.map((brand) => (
          <label key={brand} className={styles.option}>
            <input
              type="checkbox"
              checked={filters.brand.includes(brand)}
              onChange={() => toggleBrand(brand)}
            />
            {brand}
          </label>
        ))}
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
            placeholder="From"
            aria-label="Minimum price in PLN"
            defaultValue={filters.minPrice}
          />
          <span aria-hidden="true">–</span>
          <input
            className={styles.priceInput}
            type="number"
            name="maxPrice"
            min={0}
            placeholder="To"
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
