import { Link } from 'react-router'
import { useCart } from '../hooks/useCart'
import styles from './CartLink.module.css'

export function CartLink() {
  const { data: cart } = useCart()
  const count = cart?.totalQuantity ?? 0

  return (
    <Link
      to="/cart"
      className={styles.link}
      // The badge is only visual, so the full text goes to screen readers
      aria-label={count === 1 ? 'Cart, 1 item' : `Cart, ${count} items`}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6.2" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="17" cy="20" r="1.5" />
      </svg>
      <span className={styles.label}>Cart</span>
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </Link>
  )
}
