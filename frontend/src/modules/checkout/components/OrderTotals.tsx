import { formatPrice } from '@/shared/lib/formatPrice'
import styles from './OrderTotals.module.css'

type OrderTotalsProps = {
  title: string
  items: { productId: number; name: string; quantity: number; lineTotal: number }[]
  itemsTotal: number
  deliveryPrice: number
  total: number
  note?: string
}

// Used both before the order (preview from the cart) and after it
// (amounts saved in the order)
export function OrderTotals({
  title,
  items,
  itemsTotal,
  deliveryPrice,
  total,
  note,
}: OrderTotalsProps) {
  return (
    <section className={styles.summary} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.productId} className={styles.line}>
            <span>
              {item.name} <span className={styles.muted}>× {item.quantity}</span>
            </span>
            <span>{formatPrice(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <dl className={styles.totals}>
        <div className={styles.line}>
          <dt>Products</dt>
          <dd>{formatPrice(itemsTotal)}</dd>
        </div>
        <div className={styles.line}>
          <dt>Delivery</dt>
          <dd>{deliveryPrice === 0 ? 'Free' : formatPrice(deliveryPrice)}</dd>
        </div>
        <div className={`${styles.line} ${styles.total}`}>
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {note && <p className={styles.note}>{note}</p>}
    </section>
  )
}
