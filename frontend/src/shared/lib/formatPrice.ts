const priceFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
})

// Prices are stored in grosze (integers) to avoid floating point rounding errors
export function formatPrice(priceInGrosze: number): string {
  return priceFormatter.format(priceInGrosze / 100)
}
