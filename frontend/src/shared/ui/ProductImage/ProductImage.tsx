import { useState } from 'react'
import styles from './ProductImage.module.css'

type ProductImageProps = {
  src: string | null
  // Empty when the product name is already next to the image (cards, cart),
  // so screen readers don't read the name twice
  alt: string
  // true for the main image of a page: load it right away, with high priority
  priority?: boolean
}

// Fills its parent (which sets the size and shape). Shows a placeholder when
// the product has no image or the file fails to load.
export function ProductImage({ src, alt, priority = false }: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className={styles.placeholder} aria-hidden="true">
        No image
      </span>
    )
  }

  return (
    <img
      className={styles.image}
      src={src}
      alt={alt}
      // The real size of the files. The browser reserves the space before the
      // image arrives, so the page doesn't jump while loading.
      width={600}
      height={600}
      // Images below the fold load only when the user scrolls near them
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
