import { Link } from 'react-router'
import { CartItemRow, CartSummary, useCart } from '@/modules/cart'
import styles from './CartPage.module.css'

export function CartPage() {
  const { data: cart, isPending, isError } = useCart()

  return (
    <div className={`container ${styles.page}`}>
      <title>Cart – Shop</title>
      <h1 className={styles.title}>Your cart</h1>

      {isPending && <p className={styles.status}>Loading your cart…</p>}
      {isError && (
        <p className={styles.status} role="alert">
          Could not load your cart. Please try again later.
        </p>
      )}

      {cart?.items.length === 0 && (
        <p className={styles.status}>
          Your cart is empty. <Link to="/search">Browse products</Link>
        </p>
      )}

      {cart && cart.items.length > 0 && (
        <div className={styles.layout}>
          <ul className={styles.items} aria-label="Products in your cart">
            {cart.items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </ul>
          <CartSummary cart={cart} />
        </div>
      )}
    </div>
  )
}
