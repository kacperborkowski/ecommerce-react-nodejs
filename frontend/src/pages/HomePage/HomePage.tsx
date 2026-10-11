import { ProductCarousel, useProducts } from '@/modules/catalog'
import styles from './HomePage.module.css'

const FEATURED_PRODUCTS_COUNT = 10

export function HomePage() {
  const { data: products, isPending, isError } = useProducts()

  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.hero} aria-label="Logo sklepu">
        <span className={styles.heroLogo}>Shop</span>
      </section>

      {isPending && <p className={styles.status}>Ładowanie produktów…</p>}
      {isError && (
        <p className={styles.status} role="alert">
          Nie udało się pobrać produktów. Spróbuj ponownie później.
        </p>
      )}
      {products && (
        <ProductCarousel
          title="Polecane produkty"
          products={products.slice(0, FEATURED_PRODUCTS_COUNT)}
        />
      )}
    </div>
  )
}
