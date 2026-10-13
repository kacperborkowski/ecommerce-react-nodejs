import type { FormEvent } from 'react'
import { createSearchParams, useNavigate, useSearchParams } from 'react-router'
import styles from './SearchBar.module.css'

export function SearchBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentQuery = searchParams.get('q') ?? ''

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get('q') ?? '').trim()

    if (!query) return

    navigate({
      pathname: '/search',
      search: createSearchParams({ q: query }).toString(),
    })
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit}>
      <input
        // Remount the input when the URL query changes (e.g. browser back button),
        // so it always shows the phrase from the URL
        key={currentQuery}
        className={styles.input}
        type="search"
        name="q"
        placeholder="What are you looking for?"
        aria-label="Search products"
        defaultValue={currentQuery}
        maxLength={100}
      />
      <button className={styles.button} type="submit">
        Search
      </button>
    </form>
  )
}
