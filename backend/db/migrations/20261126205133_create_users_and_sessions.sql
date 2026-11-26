-- migrate:up

CREATE TABLE users (
  id            INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Saved in lower case by the backend, so "Jan@Example.com" and
  -- "jan@example.com" are the same account
  email         TEXT        NOT NULL UNIQUE CHECK (email = lower(email)),
  -- Never the password itself, only its hash (scrypt, with a random salt).
  -- Even someone who reads the database can't log in with it.
  password_hash TEXT        NOT NULL,
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A logged-in browser. The browser keeps a random token in an httpOnly
-- cookie; the database keeps only the SHA-256 hash of that token, so a
-- leaked database doesn't let anyone take over sessions.
CREATE TABLE sessions (
  token_hash TEXT        PRIMARY KEY,
  -- Deleting a user logs them out everywhere
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast "log out everywhere" and cleanup of one user's sessions
CREATE INDEX sessions_user_id_idx ON sessions (user_id);

-- migrate:down
DROP TABLE sessions;
DROP TABLE users;
