import { formatPrice } from '@/shared/lib/formatPrice'
import type { Product } from '../types'
import styles from './ProductCard.module.css'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.image}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span className={styles.imagePlaceholder} aria-hidden="true">
            Zdjęcie
          </span>
        )}
      </div>
      <h3 className={styles.name}>{product.name}</h3>
      <p className={styles.price}>{formatPrice(product.price)}</p>
    </article>
  )
}
