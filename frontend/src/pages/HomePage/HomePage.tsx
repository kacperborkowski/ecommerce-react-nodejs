import { placeholderProducts, ProductCarousel } from '@/modules/catalog'
import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <div className={`container ${styles.page}`}>
      <section className={styles.hero} aria-label="Logo sklepu">
        <span className={styles.heroLogo}>Shop</span>
      </section>
      <ProductCarousel title="Polecane produkty" products={placeholderProducts} />
    </div>
  )
}
