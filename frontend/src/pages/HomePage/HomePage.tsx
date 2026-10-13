import { ProductCarousel, useProducts } from '@/modules/catalog'
import styles from './HomePage.module.css'

const FEATURED_PRODUCTS_COUNT = 10

export function HomePage() {
  const { data: products, isPending, isError } = useProducts()

  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.hero} aria-label="Shop logo">
        <span className={styles.heroLogo}>Shop</span>
      </section>

      {isPending && <p className={styles.status}>Loading products…</p>}
      {isError && (
        <p className={styles.status} role="alert">
          Could not load products. Please try again later.
        </p>
      )}
      {products && (
        <ProductCarousel
          title="Featured products"
          products={products.slice(0, FEATURED_PRODUCTS_COUNT)}
        />
      )}
    </div>
  )
}
