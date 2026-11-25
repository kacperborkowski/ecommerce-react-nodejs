-- migrate:up

-- A shopping cart. Guests don't have accounts, so the cart id is kept in a
-- cookie. A random UUID (not 1, 2, 3...) means nobody can guess another
-- person's cart id.
CREATE TABLE carts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per product in a cart. Prices are not stored here: the cart always
-- shows the current price from products. The price is "frozen" only when an
-- order is placed.
CREATE TABLE cart_items (
  -- Foreign keys: the database refuses rows pointing to a cart or product
  -- that doesn't exist. ON DELETE CASCADE removes the items with their cart.
  cart_id    UUID        NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
  product_id INTEGER     NOT NULL REFERENCES products (id),
  quantity   INTEGER     NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- A product appears in a cart at most once. Adding it again increases
  -- the quantity instead of creating a second row.
  PRIMARY KEY (cart_id, product_id)
);

-- migrate:down
DROP TABLE cart_items;
DROP TABLE carts;
