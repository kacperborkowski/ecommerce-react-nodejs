import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import { TEST_ACCOUNT_DOMAIN } from './test-data'

const PASSWORD = 'correct horse battery'

test('user registers, logs out and signs in again, returning to the same page', async ({
  page,
}) => {
  const email = `anna-${randomUUID()}${TEST_ACCOUNT_DOMAIN}`

  // Start on a search page, so we can check the return after signing in
  await page.goto('/search?q=watch')
  await page.getByRole('link', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/login')
  await page.getByRole('link', { name: 'Create an account' }).click()

  // Mistakes are shown next to the fields before anything is sent
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('Enter your first name')).toBeVisible()
  await expect(page.getByText('Enter a valid email address')).toBeVisible()

  await page.getByLabel('First name').fill('Anna')
  await page.getByLabel('Last name').fill('Nowak')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Create account' }).click()

  // Registered and logged in, back on the search page
  await expect(page).toHaveURL('/search?q=watch')
  await expect(page.getByText('Anna', { exact: true })).toBeVisible()

  // The session survives a page reload (it's in a cookie)
  await page.reload()
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()

  // A wrong password shows the server's message
  await page.getByRole('link', { name: 'Sign in' }).click()
  await page.getByLabel('Email').fill(email.toUpperCase())
  await page.getByLabel('Password').fill('wrong password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('alert')).toHaveText('Invalid email or password')

  // The right password (email in any letter case)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL('/search?q=watch')
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible()
})

test('registering with a taken email shows an error', async ({ page, request }) => {
  const email = `taken-${randomUUID()}${TEST_ACCOUNT_DOMAIN}`
  // Create the account through the API, faster than through the form
  await request.post('/api/auth/register', {
    data: { email, password: PASSWORD, firstName: 'Jan', lastName: 'Kowalski' },
  })

  await page.goto('/register')
  await page.getByLabel('First name').fill('Jan')
  await page.getByLabel('Last name').fill('Kowalski')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByRole('alert')).toHaveText('An account with this email already exists')
  await expect(page).toHaveURL('/register')
})
