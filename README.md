# KAPOR — Clothing Store

Next.js 14 + Tailwind + Supabase clothing e-commerce store (Richkid Lifestyle style design) with a strong admin panel.

- Storefront: hero carousel, promo tiles, NEW ARRIVAL / BEST SELLING / MENS / LADIES sections, shop filters, product pages, cart drawer, COD/bKash/Nagad checkout, order tracking by phone.
- Admin (`/admin`, Supabase Auth + `profiles.role = 'admin'`): dashboard stats, product CRUD with photo upload, order pipeline, categories, store settings.
- Works without Supabase keys too — falls back to a built-in sample catalog so a fresh deploy is never blank.

Setup: see **DEPLOY-GUIDE.md**. Database: run `supabase/migration-001.sql` once.
