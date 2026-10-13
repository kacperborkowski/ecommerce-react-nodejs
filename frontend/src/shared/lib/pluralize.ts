const pluralRules = new Intl.PluralRules('pl-PL')

type PluralForms = {
  one: string
  few: string
  many: string
}

// pluralize(1, forms) → "1 produkt", 3 → "3 produkty", 5 → "5 produktów"
export function pluralize(count: number, forms: PluralForms): string {
  const rule = pluralRules.select(count)
  const form = rule === 'one' || rule === 'few' ? forms[rule] : forms.many

  return `${count} ${form}`
}
