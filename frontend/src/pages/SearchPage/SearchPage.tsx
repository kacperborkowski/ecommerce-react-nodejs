import { useSearchParams } from 'react-router'
import { ProductGrid, useProducts } from '@/modules/catalog'
import { pluralize } from '@/shared/lib/pluralize'
import styles from './SearchPage.module.css'

const PRODUCT_FORMS = { one: 'produkt', few: 'produkty', many: 'produktów' }

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const { data: products, isPending, isError } = useProducts({ q: query })

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {query ? `Wyniki wyszukiwania: „${query}”` : 'Wszystkie produkty'}
        </h1>
        {products && (
          <p className={styles.count}>{pluralize(products.length, PRODUCT_FORMS)}</p>
        )}
      </header>

      {isPending && <p className={styles.status}>Wyszukiwanie…</p>}
      {isError && (
        <p className={styles.status} role="alert">
          Nie udało się pobrać wyników. Spróbuj ponownie później.
        </p>
      )}
      {products?.length === 0 && (
        <p className={styles.status}>
          Nie znaleźliśmy produktów pasujących do „{query}”. Sprawdź pisownię lub wpisz
          inną frazę.
        </p>
      )}
      {products && products.length > 0 && <ProductGrid products={products} />}
    </div>
  )
}
