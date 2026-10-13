import { useSearchParams } from 'react-router'
import { ProductGrid, useProducts } from '@/modules/catalog'
import { pluralize } from '@/shared/lib/pluralize'
import styles from './SearchPage.module.css'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const { data: products, isPending, isError } = useProducts({ q: query })

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {query ? `Search results for “${query}”` : 'All products'}
        </h1>
        {products && (
          <p className={styles.count}>{pluralize(products.length, 'product', 'products')}</p>
        )}
      </header>

      {isPending && <p className={styles.status}>Searching…</p>}
      {isError && (
        <p className={styles.status} role="alert">
          Could not load search results. Please try again later.
        </p>
      )}
      {products?.length === 0 && (
        <p className={styles.status}>
          No products found for “{query}”. Check the spelling or try a different phrase.
        </p>
      )}
      {products && products.length > 0 && <ProductGrid products={products} />}
    </div>
  )
}
