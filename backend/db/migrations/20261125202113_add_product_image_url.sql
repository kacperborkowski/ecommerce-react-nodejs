-- migrate:up

-- Path or URL of the product image, e.g. /images/products/voltix-nova-12.svg.
-- The database stores only the address; the file itself is served separately
-- (here by the backend, in a bigger shop by a CDN or object storage).
-- NULL means "no image yet": the frontend shows a placeholder.
ALTER TABLE products ADD COLUMN image_url TEXT;

-- migrate:down
ALTER TABLE products DROP COLUMN image_url;
