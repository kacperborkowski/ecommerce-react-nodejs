-- Demo catalog: 20 products.
-- Safe to run many times: existing products (matched by slug) are updated, not duplicated.

BEGIN;

INSERT INTO products (slug, name, brand, category, description, price, stock)
VALUES
  ('voltix-nova-12', 'Voltix Nova 12', 'Voltix', 'smartphones', 'Smartphone with a 6.5" 120 Hz AMOLED display and a 5000 mAh battery.', 249900, 15),
  ('voltix-nova-12-pro', 'Voltix Nova 12 Pro', 'Voltix', 'smartphones', 'Flagship model with a triple 50 MP camera and 100 W charging.', 399900, 8),
  ('nordia-x5', 'Nordia X5', 'Nordia', 'smartphones', 'Compact 6.1" smartphone with stock Android and 5 years of updates.', 189900, 22),
  ('pixon-lite-4', 'Pixon Lite 4', 'Pixon', 'smartphones', 'Budget smartphone with a large display and two-day battery life.', 89900, 40),
  ('aurel-fold-2', 'Aurel Fold 2', 'Aurel', 'smartphones', 'Foldable smartphone with a 7.6" inner display.', 699900, 0),
  ('nordia-book-14', 'Nordia Book 14', 'Nordia', 'laptops', 'Lightweight 14" laptop (1.2 kg), 16 GB RAM, 512 GB SSD.', 429900, 12),
  ('nordia-book-16-pro', 'Nordia Book 16 Pro', 'Nordia', 'laptops', '16" laptop for creators: 3K display, 32 GB RAM, 1 TB SSD.', 819900, 5),
  ('voltix-gamebook-15', 'Voltix GameBook 15', 'Voltix', 'laptops', 'Gaming laptop with a 165 Hz display and a dedicated graphics card.', 599900, 9),
  ('pixon-study-13', 'Pixon Study 13', 'Pixon', 'laptops', 'Affordable laptop for studying and office work, 8 GB RAM.', 189900, 30),
  ('aurel-air-13', 'Aurel Air 13', 'Aurel', 'laptops', 'Thin ultrabook with an aluminium body and 18-hour battery life.', 549900, 14),
  ('aurel-buds-pro', 'Aurel Buds Pro', 'Aurel', 'headphones', 'In-ear headphones with active noise cancellation (ANC).', 99900, 50),
  ('aurel-studio-max', 'Aurel Studio Max', 'Aurel', 'headphones', 'Premium over-ear headphones with ANC and spatial audio.', 229900, 7),
  ('voltix-beat-go', 'Voltix Beat Go', 'Voltix', 'headphones', 'Wireless sports headphones resistant to sweat and water (IPX5).', 29900, 65),
  ('nordia-sound-one', 'Nordia Sound One', 'Nordia', 'headphones', 'Over-ear headphones with 60-hour battery life.', 49900, 18),
  ('pixon-pods-mini', 'Pixon Pods Mini', 'Pixon', 'headphones', 'Small, lightweight earbuds with a charging case.', 14900, 0),
  ('voltix-watch-5', 'Voltix Watch 5', 'Voltix', 'smartwatches', 'Smartwatch with GPS, heart rate monitoring and contactless payments.', 119900, 20),
  ('voltix-watch-5-classic', 'Voltix Watch 5 Classic', 'Voltix', 'smartwatches', 'Elegant version with a steel case and a rotating bezel.', 159900, 6),
  ('aurel-watch-ultra', 'Aurel Watch Ultra', 'Aurel', 'smartwatches', 'Rugged outdoor watch with a titanium case and dual-frequency GPS.', 379900, 4),
  ('nordia-band-3', 'Nordia Band 3', 'Nordia', 'smartwatches', 'Fitness band with sleep tracking and 14-day battery life.', 19900, 80),
  ('pixon-fit-2', 'Pixon Fit 2', 'Pixon', 'smartwatches', 'Simple smartwatch with notifications and workout modes.', 34900, 25)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  brand       = EXCLUDED.brand,
  category    = EXCLUDED.category,
  description = EXCLUDED.description,
  price       = EXCLUDED.price,
  stock       = EXCLUDED.stock,
  updated_at  = now();

COMMIT;
