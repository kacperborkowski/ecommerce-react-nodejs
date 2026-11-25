import { Link } from 'react-router'
import { formatPrice } from '@/shared/lib/formatPrice'
import { useRemoveCartItem, useUpdateCartItem } from '../hooks/useCart'
import type { CartItem } from '../types'
import styles from './CartItemRow.module.css'

const MAX_QUANTITY = 99

type CartItemRowProps = {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const error = updateItem.error ?? removeItem.error

  // Options from 1 up to the stock. If the stock dropped below the quantity
  // already in the cart, keep the current quantity selectable too.
  const maxQuantity = Math.max(Math.min(item.stock, MAX_QUANTITY), item.quantity)
  const quantities = Array.from({ length: maxQuantity }, (_, index) => index + 1)

  return (
    <li className={styles.row}>
      <div className={styles.image} aria-hidden="true">
        Image
      </div>

      <div className={styles.info}>
        <p className={styles.brand}>{item.brand}</p>
        <Link to={`/product/${item.slug}`} className={styles.name}>
          {item.name}
        </Link>
        <p className={styles.unitPrice}>{formatPrice(item.price)} each</p>
        {error && (
          <p className={styles.error} role="alert">
            {error.message}
          </p>
        )}
      </div>

      <div className={styles.controls}>
        <label className={styles.quantity}>
          <span className={styles.visuallyHidden}>Quantity of {item.name}</span>
          <select
            value={item.quantity}
            onChange={(event) =>
              updateItem.mutate({ productId: item.productId, quantity: Number(event.target.value) })
            }
          >
            {quantities.map((quantity) => (
              <option key={quantity} value={quantity}>
                {quantity}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.remove}
          type="button"
          onClick={() => removeItem.mutate(item.productId)}
        >
          Remove<span className={styles.visuallyHidden}> {item.name}</span>
        </button>
      </div>

      <p className={styles.lineTotal}>{formatPrice(item.lineTotal)}</p>
    </li>
  )
}
