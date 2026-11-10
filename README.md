# RX CLOTHS

RX CLOTHS is a static demo storefront for Vercel.

## Supabase data boundary

Supabase is used only for:

- **Authentication:** Supabase Auth manages sign-in email, password credentials, and its standard account/session fields. Passwords are handled by Supabase Auth; this site does not store or send a plaintext password to a custom table. Signup does not attach a name or profile metadata.
- **Saved delivery addresses:** `public.customer_addresses` stores the signed-in customer's recipient name, delivery phone, address, and default-address choice. Row Level Security restricts each customer to their own addresses.

The public database migrations create only `customer_addresses`; there is no public profile, product, image, stock, cart, wishlist, order, newsletter, or settings table. The product admin and COD order endpoint are disabled/removed.

The complete product catalogue, the 146 men's and 99 women's product images, and demonstration prices stay in the website files. The browser bag, wishlist, and simulated COD order summaries stay in this browser's local storage. No product list, product image, price, inventory, bag, wishlist, delivery details, or order is sent to Supabase. Demo checkout does not collect payment or place a real order.

## Project structure

- `robots.txt` and `404.html` — crawler policy and not-found page for static hosting.
- `vercel.json` — site-wide browser security headers for the documented Vercel host.
- `index.html`, `men.html`, `women.html`, `kids.html` — storefront and collections.
- `images/men cloths/`, `images/women cloth/`, and their image manifests — local clothing images and categories.
- `js/product-data.js` — local Men/Women/Kids catalogue and INR prices.
- `js/catalogue.js` — local catalogue, bag, wishlist, and search behavior.
- `js/demo-checkout.js` — browser-only COD checkout simulation and demo order history. It does not send or persist delivery details.
- `login.html`, `signup.html`, `account.html`, `reset-password.html` — Supabase Auth and saved delivery-address pages.
- `js/auth.js`, `js/supabase-client.js`, `js/store-api.js`, `js/storefront.js` — authentication/session and customer-owned delivery addresses only.
- `supabase/migrations/` — minimal customer-address schema and per-customer Row Level Security policies.

## Supabase setup and migration warning

This project's migration files have been narrowed to the agreed auth-and-address-only design. The migration SQL does not delete any remote tables or data.

Before using the Supabase CLI, verify the linked project and run `supabase migration list --linked`. **Do not push these edited historical migration files if any of their versions have already been applied remotely.** Reconcile the migration history with the actual database first; never reset the database or drop existing data just to make local files match.

For a confirmed fresh project with no applied migration history, set the project's public URL and publishable key in `js/supabase-config.js`, then follow the Supabase CLI's linked migration workflow. The app itself does not apply migrations or upload catalogue data.

## Run locally

From the project folder:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Auth and saved addresses need network access to the Supabase JS v2 CDN and an appropriately configured Supabase project.

Run local regression tests with Node.js:

```powershell
node --test tests/supabase-integration.test.js
```

The tests use mocked browser/API responses and inspect local SQL. They do not connect to Supabase or apply migrations.

Canonical URLs and a sitemap need the final public domain; do not publish placeholder URLs.
Verify the Vercel response headers, HTTPS redirect, and custom 404 page on the deployed
domain before treating the security-header configuration as live.
