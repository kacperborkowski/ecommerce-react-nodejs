import { Link, useParams } from 'react-router'
import { OrderTotals, useCheckoutOptions, useOrder } from '@/modules/checkout'
import { ApiError } from '@/shared/api/client'
import styles from './OrderConfirmationPage.module.css'

export function OrderConfirmationPage() {
  const { id = '' } = useParams()
  const { data: order, isPending, error } = useOrder(id)
  // Only for readable names like "Parcel locker"; ids are shown if it fails
  const { data: options } = useCheckoutOptions()

  if (isPending) {
    return <p className={`container ${styles.page} ${styles.status}`}>Loading your order…</p>
  }

  if (error) {
    const notFound = error instanceof ApiError && [400, 404].includes(error.status)
    return (
      <div className={`container ${styles.page}`}>
        <h1 className={styles.title}>{notFound ? 'Order not found' : 'Something went wrong'}</h1>
        <p className={styles.status} role="alert">
          {notFound
            ? 'Check the link to your order.'
            : 'Could not load the order. Please try again later.'}{' '}
          <Link to="/">Go to the home page</Link>
        </p>
      </div>
    )
  }

  const deliveryLabel =
    options?.deliveryMethods.find((method) => method.id === order.deliveryMethod)?.label ??
    order.deliveryMethod
  const paymentLabel =
    options?.paymentMethods.find((method) => method.id === order.paymentMethod)?.label ??
    order.paymentMethod
  // A short, readable order number from the UUID, e.g. "49379838"
  const orderNumber = order.id.slice(0, 8).toUpperCase()

  return (
    <div className={`container ${styles.page}`}>
      <title>{`Order ${orderNumber} – Shop`}</title>

      <header className={styles.header}>
        <span className={styles.badge}>Order placed</span>
        <h1 className={styles.title}>Thank you, {order.customer.firstName}!</h1>
        <p className={styles.lead}>
          Your order number is <strong>{orderNumber}</strong>. Keep this page's link to check
          your order later.
        </p>
      </header>

      <div className={styles.layout}>
        <dl className={styles.details}>
          <div>
            <dt>Delivery</dt>
            <dd>
              {deliveryLabel}
              <br />
              {order.customer.firstName} {order.customer.lastName}
              <br />
              {order.address.street}
              <br />
              {order.address.postalCode} {order.address.city}
            </dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              {order.customer.email}
              <br />
              {order.customer.phone}
            </dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>{paymentLabel}</dd>
          </div>
        </dl>

        <OrderTotals
          title="Order summary"
          items={order.items}
          itemsTotal={order.itemsTotal}
          deliveryPrice={order.deliveryPrice}
          total={order.total}
        />
      </div>

      <Link to="/" className={styles.continue}>
        Continue shopping
      </Link>
    </div>
  )
}
