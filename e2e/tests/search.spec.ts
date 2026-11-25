import { expect, test } from '@playwright/test'

// Elements are found by role and accessible name (like a screen reader does),
// so the test also checks that buttons, links and fields are labelled
test('search, filter by brand and sort the results', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('searchbox', { name: 'Search products' }).fill('watch')
  await page.getByRole('button', { name: 'Search' }).click()

  await expect(page).toHaveURL(/\/search\?q=watch/)
  await expect(page.getByRole('heading', { name: 'Search results for “watch”' })).toBeVisible()
  await expect(page.getByText('3 products')).toBeVisible()

  // Facet counts: Voltix has 2 watches
  const voltix = page.getByRole('checkbox', { name: /Voltix/ })
  await expect(voltix).toHaveAccessibleName('Voltix (2)')
  // Not voltix.check(): it expects the box to be checked right after the
  // click, but here the click changes the URL and the box follows a few
  // milliseconds later. toBeChecked() waits for that.
  await voltix.click()
  await expect(voltix).toBeChecked()

  await expect(page).toHaveURL(/brand=Voltix/)
  await expect(page.getByText('2 products')).toBeVisible()

  const productNames = page.getByRole('heading', { level: 3 })
  await expect(productNames).toHaveText(['Voltix Watch 5', 'Voltix Watch 5 Classic'])

  await page.getByLabel('Sort by').selectOption({ label: 'Price: high to low' })
  await expect(productNames).toHaveText(['Voltix Watch 5 Classic', 'Voltix Watch 5'])

  // The back button undoes the last change, because filters live in the URL
  await page.goBack()
  await expect(productNames).toHaveText(['Voltix Watch 5', 'Voltix Watch 5 Classic'])
})
