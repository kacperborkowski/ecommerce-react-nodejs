import type { ReactNode } from 'react'
import { formatPrice } from '@/shared/lib/formatPrice'
import { pluralize } from '@/shared/lib/pluralize'
import type { Cart } from '../types'
import styles from './CartSummary.module.css'

type CartSummaryProps = {
  cart: Cart
  // e.g. the "Proceed to checkout" link, passed in by the page
  children?: ReactNode
}

export function CartSummary({ cart, children }: CartSummaryProps) {
  return (
    <section className={styles.summary} aria-label="Order summary">
      <h2 className={styles.title}>Summary</h2>
      <dl className={styles.list}>
        <div className={styles.line}>
          <dt>{pluralize(cart.totalQuantity, 'item', 'items')}</dt>
          <dd>{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className={`${styles.line} ${styles.total}`}>
          <dt>Subtotal</dt>
          <dd>{formatPrice(cart.subtotal)}</dd>
        </div>
      </dl>
      <p className={styles.note}>Delivery and payment are chosen at checkout.</p>
      {children}
    </section>
  )
}
