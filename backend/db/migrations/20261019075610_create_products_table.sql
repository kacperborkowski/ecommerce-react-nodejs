-- migrate:up
CREATE TABLE products (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  brand       TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  -- Price in grosze (1 PLN = 100 grosze), same as in the API
  price       INTEGER     NOT NULL CHECK (price >= 0),
  stock       INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE products;
