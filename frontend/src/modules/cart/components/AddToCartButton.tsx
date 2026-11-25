import { Link } from 'react-router'
import { useAddToCart, useCart } from '../hooks/useCart'
import styles from './AddToCartButton.module.css'

type AddToCartButtonProps = {
  productId: number
  stock: number
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const { data: cart } = useCart()
  const addToCart = useAddToCart()

  const inCart = cart?.items.find((item) => item.productId === productId)?.quantity ?? 0
  const outOfStock = stock === 0
  // The server checks this too; here it just disables the button early
  const limitReached = !outOfStock && inCart >= stock

  const label = outOfStock
    ? 'Out of stock'
    : limitReached
      ? 'All available pieces are in your cart'
      : addToCart.isPending
        ? 'Adding…'
        : 'Add to cart'

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        type="button"
        disabled={outOfStock || limitReached || addToCart.isPending}
        onClick={() => addToCart.mutate({ productId })}
      >
        {label}
      </button>

      {/* aria-live: screen readers announce the message when it appears */}
      <p className={styles.message} aria-live="polite">
        {addToCart.isError && (
          <span className={styles.error}>{addToCart.error.message}</span>
        )}
        {!addToCart.isError && inCart > 0 && (
          <>
            {inCart} in your cart · <Link to="/cart">View cart</Link>
          </>
        )}
      </p>
    </div>
  )
}
