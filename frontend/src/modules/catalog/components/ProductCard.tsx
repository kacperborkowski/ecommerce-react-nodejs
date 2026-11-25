import { Link } from 'react-router'
import { formatPrice } from '@/shared/lib/formatPrice'
import type { Product } from '../types'
import styles from './ProductCard.module.css'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article>
      <Link to={`/product/${product.slug}`} className={styles.card}>
        <div className={styles.image}>
          <span className={styles.imagePlaceholder} aria-hidden="true">
            Image
          </span>
        </div>
        <p className={styles.brand}>{product.brand}</p>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{formatPrice(product.price)}</p>
      </Link>
    </article>
  )
}
