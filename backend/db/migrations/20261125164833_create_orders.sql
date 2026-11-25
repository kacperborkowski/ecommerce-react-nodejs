-- migrate:up

CREATE TABLE orders (
  -- A random UUID, because it appears in the order confirmation link
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Sent by the browser with every "Place order" click. The same key twice
  -- (e.g. a double click or a retry after a network error) returns the
  -- existing order instead of creating a second one.
  idempotency_key  UUID        NOT NULL UNIQUE,
  status           TEXT        NOT NULL DEFAULT 'placed'
                               CHECK (status IN ('placed', 'paid', 'shipped', 'cancelled')),

  email            TEXT        NOT NULL,
  first_name       TEXT        NOT NULL,
  last_name        TEXT        NOT NULL,
  phone            TEXT        NOT NULL,
  street           TEXT        NOT NULL,
  postal_code      TEXT        NOT NULL,
  city             TEXT        NOT NULL,

  delivery_method  TEXT        NOT NULL
                               CHECK (delivery_method IN ('courier', 'parcel_locker', 'pickup')),
  payment_method   TEXT        NOT NULL
                               CHECK (payment_method IN ('card', 'blik', 'bank_transfer', 'cash_on_delivery')),

  -- All amounts in grosze, saved at the moment of the order
  items_total      INTEGER     NOT NULL CHECK (items_total >= 0),
  delivery_price   INTEGER     NOT NULL CHECK (delivery_price >= 0),
  total            INTEGER     NOT NULL CHECK (total = items_total + delivery_price),

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unlike cart_items, order items keep a copy of the product name and price.
-- If the price changes tomorrow, the order still shows what the customer paid.
CREATE TABLE order_items (
  order_id     UUID    NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id   INTEGER NOT NULL REFERENCES products (id),
  product_name TEXT    NOT NULL,
  unit_price   INTEGER NOT NULL CHECK (unit_price >= 0),
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  line_total   INTEGER NOT NULL CHECK (line_total = unit_price * quantity),
  PRIMARY KEY (order_id, product_id)
);

-- migrate:down
DROP TABLE order_items;
DROP TABLE orders;
