const pluralRules = new Intl.PluralRules('en-US')

// pluralize(1, 'product', 'products') → "1 product", pluralize(3, ...) → "3 products"
export function pluralize(count: number, singular: string, plural: string): string {
  const form = pluralRules.select(count) === 'one' ? singular : plural

  return `${count} ${form}`
}
