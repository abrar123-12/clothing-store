-- migration-001.sql — KAPOR clothing store: tables, RLS, storage, seeds. Run ONCE in Supabase SQL Editor.
-- ============================================================
-- TABLES
-- ============================================================
create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  price numeric not null default 0,
  sale_price numeric,
  image_url text not null default '',
  sizes jsonb not null default '[]'::jsonb,
  stock int not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  area text not null default 'dhaka',
  payment_method text not null default 'COD',
  payment_trx text,
  subtotal numeric not null default 0,
  delivery_charge numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null default '',
  product_name text not null default '',
  size text not null default '',
  price numeric not null default 0,
  qty int not null default 1
);

create table if not exists public.settings (
  id int primary key,
  store_name text not null default 'KAPOR',
  bkash_number text not null default '',
  nagad_number text not null default '',
  delivery_dhaka numeric not null default 60,
  delivery_outside numeric not null default 120,
  free_threshold numeric not null default 2000,
  facebook_url text not null default '',
  hero_banners jsonb not null default '[]'::jsonb
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ADMIN CHECK HELPER + AUTO PROFILE ON SIGNUP
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Order tracking by phone (customers have no account, so they cannot SELECT
-- orders directly — this safe function only returns orders for one phone).
create or replace function public.track_orders(p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  select coalesce(jsonb_agg(row_data order by created_at desc), '[]'::jsonb) into result
  from (
    select o.created_at,
      jsonb_build_object(
        'id', o.id, 'customer_name', o.customer_name, 'phone', o.phone,
        'address', o.address, 'area', o.area, 'payment_method', o.payment_method,
        'payment_trx', o.payment_trx, 'subtotal', o.subtotal,
        'delivery_charge', o.delivery_charge, 'total', o.total,
        'status', o.status, 'created_at', o.created_at,
        'order_items', coalesce((
          select jsonb_agg(jsonb_build_object(
            'product_id', i.product_id, 'product_name', i.product_name,
            'size', i.size, 'price', i.price, 'qty', i.qty))
          from public.order_items i where i.order_id = o.id
        ), '[]'::jsonb)
      ) as row_data
    from public.orders o
    where o.phone = p_phone
  ) t;
  return result;
end;
$$;
grant execute on function public.track_orders(text) to anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;
alter table public.profiles enable row level security;

-- categories: public read, admin write
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- products: public read active only (admin sees all), admin write
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (active = true or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- settings: public read, admin write
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- orders: anyone can place an order (insert), only admin can read/update.
-- Customers track orders through the track_orders() function above.
drop policy if exists "orders public insert" on public.orders;
create policy "orders public insert" on public.orders for insert with check (true);
drop policy if exists "orders admin read" on public.orders;
create policy "orders admin read" on public.orders for select using (public.is_admin());
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders admin delete" on public.orders;
create policy "orders admin delete" on public.orders for delete using (public.is_admin());

-- order_items: anyone can insert with their order, only admin can read directly
drop policy if exists "order_items public insert" on public.order_items;
create policy "order_items public insert" on public.order_items for insert with check (true);
drop policy if exists "order_items admin read" on public.order_items;
create policy "order_items admin read" on public.order_items for select using (public.is_admin());

-- profiles: user reads own profile, admin reads all; no direct client writes
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());

-- ============================================================
-- STORAGE: product-photos bucket (public read, admin write)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

drop policy if exists "product photos public read" on storage.objects;
create policy "product photos public read" on storage.objects
  for select using (bucket_id = 'product-photos');
drop policy if exists "product photos admin insert" on storage.objects;
create policy "product photos admin insert" on storage.objects
  for insert with check (bucket_id = 'product-photos' and public.is_admin());
drop policy if exists "product photos admin update" on storage.objects;
create policy "product photos admin update" on storage.objects
  for update using (bucket_id = 'product-photos' and public.is_admin());
drop policy if exists "product photos admin delete" on storage.objects;
create policy "product photos admin delete" on storage.objects
  for delete using (bucket_id = 'product-photos' and public.is_admin());

-- ============================================================
-- SEEDS
-- ============================================================
insert into public.categories (name, slug) values
  ('Men', 'men'), ('Women', 'women'), ('Accessories', 'accessories'), ('Kids', 'kids')
on conflict (slug) do nothing;

insert into public.settings (id, store_name, bkash_number, nagad_number, delivery_dhaka, delivery_outside, free_threshold, facebook_url, hero_banners)
values (1, 'KAPOR', '', '', 60, 120, 2000, '',
  '[
    {"image":"https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop","headline":"BIG SALE UP TO 50% OFF","subheadline":"New season clothing collection","link":"/shop"},
    {"image":"https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1600&auto=format&fit=crop","headline":"NEW ARRIVAL","subheadline":"Premium shirts, hoodies and more","link":"/shop?category=men"},
    {"image":"https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop","headline":"LADIES COLLECTION","subheadline":"Saree, dress, three-piece and abaya","link":"/shop?category=women"}
  ]'::jsonb)
on conflict (id) do nothing;

insert into public.products (name, description, category_id, price, sale_price, image_url, sizes, stock, featured)
select v.name, v.description, (select id from public.categories where slug = v.slug), v.price, v.sale_price, v.image_url, v.sizes, v.stock, v.featured
from (values
  ('Premium Linen Shirt', 'Breathable premium linen shirt. Perfect for Dhaka weather.', 'men', 2400, 1850, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=900&auto=format&fit=crop', '["S","M","L","XL"]'::jsonb, 25, true),
  ('Charcoal Hoodie', 'Heavy 320 GSM fleece hoodie with kangaroo pocket.', 'men', 1800, 1250, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900&auto=format&fit=crop', '["M","L","XL"]'::jsonb, 18, true),
  ('Premium Panjabi', 'Soft cotton panjabi with fine embroidery.', 'men', 3200, 2450, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop', '["40","42","44"]'::jsonb, 12, true),
  ('Slim Fit Jeans', 'Stretch denim slim fit jeans, fade-proof wash.', 'men', 2200, 1650, 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=900&auto=format&fit=crop', '["30","32","34","36"]'::jsonb, 20, false),
  ('Graphic Tee', '100% cotton graphic t-shirt, 180 GSM.', 'men', 950, 750, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=900&auto=format&fit=crop', '["S","M","L","XL"]'::jsonb, 40, false),
  ('Biker Jacket', 'Premium faux-leather biker jacket.', 'men', 4500, 3600, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=900&auto=format&fit=crop', '["M","L","XL"]'::jsonb, 8, true),
  ('Floral Summer Dress', 'Light floral dress, comfortable summer fit.', 'women', 2800, 2100, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop', '["S","M","L"]'::jsonb, 15, true),
  ('Silk Saree', 'Soft silk saree with zari border and blouse piece.', 'women', 6500, 4500, 'https://images.unsplash.com/photo-1610189844806-3bab762b10ab?q=80&w=900&auto=format&fit=crop', '["Free"]'::jsonb, 6, true),
  ('Three-Piece Set', 'Cotton three-piece set with printed orna.', 'women', 3400, 2650, 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=900&auto=format&fit=crop', '["38","40","42"]'::jsonb, 14, false),
  ('Modest Abaya', 'Elegant Dubai-style abaya, premium nidha fabric.', 'women', 3800, 2950, 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=900&auto=format&fit=crop', '["52","54","56"]'::jsonb, 10, false),
  ('Casual Blouse', 'Everyday casual blouse, easy to pair.', 'women', 1600, 1200, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=900&auto=format&fit=crop', '["S","M","L"]'::jsonb, 22, false),
  ('Classic Polo', 'Pique cotton polo with embroidered logo.', 'men', 1450, 1100, 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=900&auto=format&fit=crop', '["M","L","XL"]'::jsonb, 30, false)
) as v(name, description, slug, price, sale_price, image_url, sizes, stock, featured)
where not exists (select 1 from public.products p where p.name = v.name);

-- ============================================================
-- MAKE YOURSELF ADMIN (run AFTER creating your user in Auth):
-- 1) Supabase Dashboard -> Authentication -> Users -> Add user
--    (your email + password, tick Auto Confirm User)
-- 2) Copy that user's UID, paste it below, uncomment and run:
-- insert into public.profiles (id, role) values ('YOUR-USER-UID', 'admin')
-- on conflict (id) do update set role = 'admin';
-- ============================================================
