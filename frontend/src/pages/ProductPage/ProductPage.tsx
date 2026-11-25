import { Link, useParams } from 'react-router'
import { useProduct } from '@/modules/catalog'
import { ProductDetails } from '@/modules/product'
import { ApiError } from '@/shared/api/client'
import styles from './ProductPage.module.css'

export function ProductPage() {
  // The router only renders this page for /product/:slug, so slug is always set
  const { slug = '' } = useParams()
  const { data: product, isPending, error } = useProduct(slug)

  if (isPending) {
    return <p className={`container ${styles.status}`}>Loading product…</p>
  }

  if (error instanceof ApiError && error.status === 404) {
    return (
      <div className={`container ${styles.page}`}>
        <title>Product not found – Shop</title>
        <h1 className={styles.title}>Product not found</h1>
        <p className={styles.message}>
          This product doesn’t exist or is no longer available.{' '}
          <Link to="/">Go to the home page</Link>
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <p className={`container ${styles.status}`} role="alert">
        Could not load the product. Please try again later.
      </p>
    )
  }

  return (
    <div className={`container ${styles.page}`}>
      {/* React 19 moves <title> into <head> automatically */}
      <title>{`${product.name} – Shop`}</title>
      <ProductDetails product={product} />
    </div>
  )
}
