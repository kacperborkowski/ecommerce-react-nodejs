import { expect, test, type Page } from '@playwright/test'
import { TEST_EMAIL } from './test-data'

// Every test starts in a fresh browser context: new cookies, so a new empty cart

test('guest finds a product, adds it to the cart and places an order', async ({ page }) => {
  // Search and open the product page
  await page.goto('/')
  await page.getByRole('searchbox', { name: 'Search products' }).fill('beat go')
  await page.getByRole('button', { name: 'Search' }).click()
  await page.getByRole('link', { name: /Voltix Beat Go/ }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Voltix Beat Go' })).toBeVisible()

  // Add to cart: the header badge follows
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await expect(page.getByText('1 in your cart')).toBeVisible()
  await page.getByRole('link', { name: 'Cart, 1 item' }).click()

  // Change the quantity in the cart
  await expect(page).toHaveURL('/cart')
  await page.getByLabel('Quantity of Voltix Beat Go').selectOption('2')
  await expect(page.getByRole('link', { name: 'Cart, 2 items' })).toBeVisible()
  await expect(page.getByLabel('Order summary')).toContainText('PLN 598.00')

  // Checkout
  await page.getByRole('link', { name: 'Proceed to checkout' }).click()
  await fillCheckoutForm(page)
  await page.getByRole('radio', { name: /Parcel locker/ }).check()
  await page.getByRole('radio', { name: 'BLIK' }).check()

  // 2 × 299.00 + 9.99 delivery
  await expect(page.getByLabel('Your order')).toContainText('PLN 607.99')

  await page.getByRole('button', { name: 'Place order' }).click()

  // Confirmation
  await expect(page).toHaveURL(/\/order\/[0-9a-f-]{36}$/)
  await expect(page.getByRole('heading', { name: 'Thank you, Jan!' })).toBeVisible()
  await expect(page.getByLabel('Order summary')).toContainText('PLN 607.99')
  await expect(page.getByText('Parcel locker')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Cart, 0 items' })).toBeVisible()

  // The confirmation survives a page reload, because it comes from the API
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Thank you, Jan!' })).toBeVisible()
})

test('checkout shows validation errors and sends nothing', async ({ page }) => {
  // Fill the cart through the API. page.request shares cookies with the page.
  await page.request.post('/api/cart/items', { data: { productId: 13 } })

  let orderRequests = 0
  page.on('request', (request) => {
    if (request.url().includes('/api/orders')) orderRequests++
  })

  await page.goto('/checkout')
  await page.getByRole('button', { name: 'Place order' }).click()

  await expect(page.getByText('Enter a valid email address')).toBeVisible()
  await expect(page.getByText('Enter your first name')).toBeVisible()
  await expect(page.getByText('Use the format 00-000')).toBeVisible()
  // The first invalid field gets focus, so keyboard users land on it
  await expect(page.getByLabel('Email')).toBeFocused()

  // Fixing a field removes its message right away
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await expect(page.getByText('Enter a valid email address')).toBeHidden()

  expect(orderRequests).toBe(0)
})

async function fillCheckoutForm(page: Page) {
  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.getByLabel('First name').fill('Jan')
  await page.getByLabel('Last name').fill('Kowalski')
  await page.getByLabel('Phone').fill('+48 600 100 200')
  await page.getByLabel('Street and number').fill('Prosta 1')
  await page.getByLabel('Postal code').fill('00-950')
  await page.getByLabel('City').fill('Warszawa')
}
