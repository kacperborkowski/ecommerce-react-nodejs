-- Demo catalog: 20 products.
-- Safe to run many times: existing products (matched by slug) are updated, not duplicated.

BEGIN;

INSERT INTO products (slug, name, brand, category, description, price, stock, image_url)
VALUES
  ('voltix-nova-12', 'Voltix Nova 12', 'Voltix', 'smartphones', 'Smartphone with a 6.5" 120 Hz AMOLED display and a 5000 mAh battery.', 249900, 15, '/images/products/voltix-nova-12.svg'),
  ('voltix-nova-12-pro', 'Voltix Nova 12 Pro', 'Voltix', 'smartphones', 'Flagship model with a triple 50 MP camera and 100 W charging.', 399900, 8, '/images/products/voltix-nova-12-pro.svg'),
  ('nordia-x5', 'Nordia X5', 'Nordia', 'smartphones', 'Compact 6.1" smartphone with stock Android and 5 years of updates.', 189900, 22, '/images/products/nordia-x5.svg'),
  ('pixon-lite-4', 'Pixon Lite 4', 'Pixon', 'smartphones', 'Budget smartphone with a large display and two-day battery life.', 89900, 40, '/images/products/pixon-lite-4.svg'),
  ('aurel-fold-2', 'Aurel Fold 2', 'Aurel', 'smartphones', 'Foldable smartphone with a 7.6" inner display.', 699900, 0, '/images/products/aurel-fold-2.svg'),
  ('nordia-book-14', 'Nordia Book 14', 'Nordia', 'laptops', 'Lightweight 14" laptop (1.2 kg), 16 GB RAM, 512 GB SSD.', 429900, 12, '/images/products/nordia-book-14.svg'),
  ('nordia-book-16-pro', 'Nordia Book 16 Pro', 'Nordia', 'laptops', '16" laptop for creators: 3K display, 32 GB RAM, 1 TB SSD.', 819900, 5, '/images/products/nordia-book-16-pro.svg'),
  ('voltix-gamebook-15', 'Voltix GameBook 15', 'Voltix', 'laptops', 'Gaming laptop with a 165 Hz display and a dedicated graphics card.', 599900, 9, '/images/products/voltix-gamebook-15.svg'),
  ('pixon-study-13', 'Pixon Study 13', 'Pixon', 'laptops', 'Affordable laptop for studying and office work, 8 GB RAM.', 189900, 30, '/images/products/pixon-study-13.svg'),
  ('aurel-air-13', 'Aurel Air 13', 'Aurel', 'laptops', 'Thin ultrabook with an aluminium body and 18-hour battery life.', 549900, 14, '/images/products/aurel-air-13.svg'),
  ('aurel-buds-pro', 'Aurel Buds Pro', 'Aurel', 'headphones', 'In-ear headphones with active noise cancellation (ANC).', 99900, 50, '/images/products/aurel-buds-pro.svg'),
  ('aurel-studio-max', 'Aurel Studio Max', 'Aurel', 'headphones', 'Premium over-ear headphones with ANC and spatial audio.', 229900, 7, '/images/products/aurel-studio-max.svg'),
  ('voltix-beat-go', 'Voltix Beat Go', 'Voltix', 'headphones', 'Wireless sports headphones resistant to sweat and water (IPX5).', 29900, 65, '/images/products/voltix-beat-go.svg'),
  ('nordia-sound-one', 'Nordia Sound One', 'Nordia', 'headphones', 'Over-ear headphones with 60-hour battery life.', 49900, 18, '/images/products/nordia-sound-one.svg'),
  ('pixon-pods-mini', 'Pixon Pods Mini', 'Pixon', 'headphones', 'Small, lightweight earbuds with a charging case.', 14900, 0, '/images/products/pixon-pods-mini.svg'),
  ('voltix-watch-5', 'Voltix Watch 5', 'Voltix', 'smartwatches', 'Smartwatch with GPS, heart rate monitoring and contactless payments.', 119900, 20, '/images/products/voltix-watch-5.svg'),
  ('voltix-watch-5-classic', 'Voltix Watch 5 Classic', 'Voltix', 'smartwatches', 'Elegant version with a steel case and a rotating bezel.', 159900, 6, '/images/products/voltix-watch-5-classic.svg'),
  ('aurel-watch-ultra', 'Aurel Watch Ultra', 'Aurel', 'smartwatches', 'Rugged outdoor watch with a titanium case and dual-frequency GPS.', 379900, 4, '/images/products/aurel-watch-ultra.svg'),
  ('nordia-band-3', 'Nordia Band 3', 'Nordia', 'smartwatches', 'Fitness band with sleep tracking and 14-day battery life.', 19900, 80, '/images/products/nordia-band-3.svg'),
  ('pixon-fit-2', 'Pixon Fit 2', 'Pixon', 'smartwatches', 'Simple smartwatch with notifications and workout modes.', 34900, 25, '/images/products/pixon-fit-2.svg')
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  brand       = EXCLUDED.brand,
  category    = EXCLUDED.category,
  description = EXCLUDED.description,
  price       = EXCLUDED.price,
  stock       = EXCLUDED.stock,
  image_url   = EXCLUDED.image_url,
  updated_at  = now();

COMMIT;
