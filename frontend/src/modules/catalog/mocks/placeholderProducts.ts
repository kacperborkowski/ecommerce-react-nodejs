import type { Product } from '../types'

export const placeholderProducts: Product[] = Array.from({ length: 10 }, (_, index) => ({
  id: `placeholder-${index + 1}`,
  name: `Produkt ${index + 1}`,
  price: 4999 + index * 1000,
}))
