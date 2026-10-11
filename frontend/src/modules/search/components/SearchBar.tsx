import { useState, type FormEvent } from 'react'
import styles from './SearchBar.module.css'

type SearchBarProps = {
  onSearch?: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuery = query.trim()

    if (trimmedQuery) {
      onSearch?.(trimmedQuery)
    }
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="search"
        name="q"
        placeholder="Czego szukasz?"
        aria-label="Szukaj produktów"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button className={styles.button} type="submit">
        Szukaj
      </button>
    </form>
  )
}
