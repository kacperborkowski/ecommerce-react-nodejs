import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCart } from '@/modules/cart'
import {
  CheckoutForm,
  OrderTotals,
  useCheckoutOptions,
  usePlaceOrder,
  type CheckoutFormValues,
} from '@/modules/checkout'
import { ApiError } from '@/shared/api/client'
import styles from './CheckoutPage.module.css'

export function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart, isPending: cartPending, isError: cartError } = useCart()
  const { data: options, isPending: optionsPending, isError: optionsError } =
    useCheckoutOptions()
  const placeOrder = usePlaceOrder()

  // One key for this checkout. If "Place order" is clicked twice, or sent
  // again after a network error, the server returns the same order.
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  const handleSubmit = (values: CheckoutFormValues) => {
    placeOrder.mutate(
      { idempotencyKey, ...values },
      {
        // replace: the back button won't return to a checkout that's done
        onSuccess: (order) => navigate(`/order/${order.id}`, { replace: true }),
      },
    )
  }

  const page = (content: ReactNode) => (
    <div className={`container ${styles.page}`}>
      <title>Checkout – Shop</title>
      <h1 className={styles.title}>Checkout</h1>
      {content}
    </div>
  )

  if (cartPending || optionsPending) {
    return page(<p className={styles.status}>Loading…</p>)
  }

  if (cartError || optionsError) {
    return page(
      <p className={styles.status} role="alert">
        Could not load the checkout. Please try again later.
      </p>,
    )
  }

  // Hide the form only when no order is being placed: right after a success
  // the cart is empty, but the page is about to switch to the confirmation
  if (cart.items.length === 0 && !placeOrder.isPending && !placeOrder.isSuccess) {
    return page(
      <p className={styles.status}>
        Your cart is empty. <Link to="/search">Browse products</Link>
      </p>,
    )
  }

  return page(
    <CheckoutForm
      options={options}
      onSubmit={handleSubmit}
      isSubmitting={placeOrder.isPending}
      serverError={placeOrder.error && <ServerError error={placeOrder.error} />}
      renderSummary={(deliveryPrice) => (
        <OrderTotals
          title="Your order"
          items={cart.items}
          itemsTotal={cart.subtotal}
          deliveryPrice={deliveryPrice}
          total={cart.subtotal + deliveryPrice}
          note="Final amounts are calculated by the shop when you place the order."
        />
      )}
    />,
  )
}

function ServerError({ error }: { error: Error }) {
  // 409: stock changed since the products were added to the cart
  if (error instanceof ApiError && error.status === 409) {
    return (
      <>
        {error.message} <Link to="/cart">Go to cart</Link>
      </>
    )
  }

  if (error instanceof ApiError && error.status < 500) {
    return <>{error.message}</>
  }

  return <>Could not place the order. Please try again.</>
}
