import type { Product } from '@/modules/catalog'
import { formatPrice } from '@/shared/lib/formatPrice'
import styles from './ProductDetails.module.css'

const LOW_STOCK_THRESHOLD = 5

type ProductDetailsProps = {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <article className={styles.details}>
      <div className={styles.image}>
        <span className={styles.imagePlaceholder} aria-hidden="true">
          Image
        </span>
      </div>

      <div className={styles.info}>
        <p className={styles.brand}>{product.brand}</p>
        <h1 className={styles.name}>{product.name}</h1>
        <p className={styles.category}>{product.category}</p>
        <p className={styles.price}>{formatPrice(product.price)}</p>
        <StockStatus stock={product.stock} />
        <p className={styles.description}>{product.description}</p>
      </div>
    </article>
  )
}

function StockStatus({ stock }: { stock: number }) {
  if (stock === 0) {
    return <p className={`${styles.stock} ${styles.outOfStock}`}>Out of stock</p>
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return <p className={`${styles.stock} ${styles.lowStock}`}>Only {stock} left in stock</p>
  }

  return <p className={`${styles.stock} ${styles.inStock}`}>In stock</p>
}
