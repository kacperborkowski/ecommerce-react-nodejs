import { z } from 'zod'

// The same rules as PlaceOrderDto in the backend. Checking them in the browser
// shows mistakes next to the fields right away; the server still checks
// everything again, because a request can be sent without this form.
export const checkoutSchema = z.object({
  customer: z.object({
    email: z.email({ error: 'Enter a valid email address' }).max(254),
    firstName: z.string().trim().min(1, 'Enter your first name').max(100),
    lastName: z.string().trim().min(1, 'Enter your last name').max(100),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ]{9,20}$/, 'Enter a valid phone number, e.g. +48 600 100 200'),
  }),
  address: z.object({
    street: z.string().trim().min(1, 'Enter your street and number').max(200),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{2}-\d{3}$/, 'Use the format 00-000'),
    city: z.string().trim().min(1, 'Enter your city').max(100),
  }),
  deliveryMethod: z.enum(['courier', 'parcel_locker', 'pickup'], {
    error: 'Choose a delivery method',
  }),
  paymentMethod: z.enum(['card', 'blik', 'bank_transfer', 'cash_on_delivery'], {
    error: 'Choose a payment method',
  }),
})

// The form values type comes from the schema, so they can't drift apart
export type CheckoutFormValues = z.infer<typeof checkoutSchema>
