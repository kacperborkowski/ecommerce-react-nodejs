import type { ProductSort } from '../types'
import styles from './SortSelect.module.css'

const SORT_OPTIONS: { value: ProductSort | ''; label: string }[] = [
  { value: '', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A to Z' },
]

type SortSelectProps = {
  value?: ProductSort
  onChange: (sort: ProductSort | undefined) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className={styles.label}>
      Sort by
      <select
        className={styles.select}
        value={value ?? ''}
        // An empty value means "Recommended", i.e. no sort param in the URL
        onChange={(event) => onChange((event.target.value || undefined) as ProductSort | undefined)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
