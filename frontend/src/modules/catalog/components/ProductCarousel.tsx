import { useRef } from 'react'
import type { Product } from '../types'
import { ProductCard } from './ProductCard'
import styles from './ProductCarousel.module.css'

type ProductCarouselProps = {
  title: string
  products: Product[]
}

export function ProductCarousel({ title, products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null)

  const scroll = (direction: 'prev' | 'next') => {
    const track = trackRef.current
    if (!track) return

    const offset = direction === 'next' ? track.clientWidth : -track.clientWidth
    track.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <section className={styles.carousel} aria-label={title}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.control}
            aria-label="Poprzednie produkty"
            onClick={() => scroll('prev')}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.control}
            aria-label="Następne produkty"
            onClick={() => scroll('next')}
          >
            ›
          </button>
        </div>
      </div>
      <ul ref={trackRef} className={styles.track}>
        {products.map((product) => (
          <li key={product.id} className={styles.item}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}
