export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  brand: string;
  // Current product price in grosze
  price: number;
  // How many are available, so the frontend can limit the quantity input
  stock: number;
  quantity: number;
  // price * quantity, calculated by the server
  lineTotal: number;
}

// Response of every /api/cart endpoint. Totals are always calculated on the
// server: the frontend only displays them, so it can't send a wrong price.
export interface Cart {
  items: CartItem[];
  // Number of pieces, e.g. 2 headphones + 1 phone = 3 (badge in the header)
  totalQuantity: number;
  // Sum of all line totals in grosze
  subtotal: number;
}
