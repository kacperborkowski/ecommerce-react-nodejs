import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { formatPrice } from '@/shared/lib/formatPrice'
import { TextField } from '@/shared/ui/TextField'
import { checkoutSchema, type CheckoutFormValues } from '../schema'
import type { CheckoutOptions } from '../types'
import styles from './CheckoutForm.module.css'

type CheckoutFormProps = {
  options: CheckoutOptions
  onSubmit: (values: CheckoutFormValues) => void
  isSubmitting: boolean
  // Shown above the submit button, e.g. "Not enough stock"
  serverError?: ReactNode
  // The page renders the order summary; the form tells it the delivery price
  renderSummary: (deliveryPrice: number) => ReactNode
}

export function CheckoutForm({
  options,
  onSubmit,
  isSubmitting,
  serverError,
  renderSummary,
}: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    // zodResolver runs the schema on submit, and again on every change after
    // the first submit, so error messages disappear as soon as they're fixed
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer: { email: '', firstName: '', lastName: '', phone: '' },
      address: { street: '', postalCode: '', city: '' },
      deliveryMethod: 'courier',
      paymentMethod: 'card',
    },
  })

  // useWatch re-renders when the delivery method changes, so the total updates
  const deliveryMethod = useWatch({ control, name: 'deliveryMethod' })
  const deliveryPrice =
    options.deliveryMethods.find((method) => method.id === deliveryMethod)?.price ?? 0

  return (
    // noValidate: the schema shows its own messages instead of browser popups
    <form className={styles.layout} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.fields}>
        <fieldset className={styles.section}>
          <legend className={styles.legend}>Contact</legend>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            className={styles.wide}
            error={errors.customer?.email?.message}
            {...register('customer.email')}
          />
          <TextField
            label="First name"
            autoComplete="given-name"
            error={errors.customer?.firstName?.message}
            {...register('customer.firstName')}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            error={errors.customer?.lastName?.message}
            {...register('customer.lastName')}
          />
          <TextField
            label="Phone"
            type="tel"
            autoComplete="tel"
            className={styles.wide}
            error={errors.customer?.phone?.message}
            {...register('customer.phone')}
          />
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.legend}>Delivery address</legend>
          <TextField
            label="Street and number"
            autoComplete="street-address"
            className={styles.wide}
            error={errors.address?.street?.message}
            {...register('address.street')}
          />
          <TextField
            label="Postal code"
            autoComplete="postal-code"
            placeholder="00-000"
            error={errors.address?.postalCode?.message}
            {...register('address.postalCode')}
          />
          <TextField
            label="City"
            autoComplete="address-level2"
            error={errors.address?.city?.message}
            {...register('address.city')}
          />
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.legend}>Delivery method</legend>
          <div className={`${styles.choices} ${styles.wide}`}>
            {options.deliveryMethods.map((method) => (
              <label key={method.id} className={styles.choice}>
                <input type="radio" value={method.id} {...register('deliveryMethod')} />
                <span>{method.label}</span>
                <span className={styles.choicePrice}>
                  {method.price === 0 ? 'Free' : formatPrice(method.price)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend className={styles.legend}>Payment</legend>
          <div className={`${styles.choices} ${styles.wide}`}>
            {options.paymentMethods.map((method) => (
              <label key={method.id} className={styles.choice}>
                <input type="radio" value={method.id} {...register('paymentMethod')} />
                <span>{method.label}</span>
              </label>
            ))}
          </div>
          <p className={`${styles.note} ${styles.wide}`}>
            This is a demo shop: no payment is taken.
          </p>
        </fieldset>
      </div>

      <div className={styles.side}>
        {renderSummary(deliveryPrice)}
        {serverError && (
          <div className={styles.serverError} role="alert">
            {serverError}
          </div>
        )}
        <button className={styles.submit} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Placing order…' : 'Place order'}
        </button>
      </div>
    </form>
  )
}
