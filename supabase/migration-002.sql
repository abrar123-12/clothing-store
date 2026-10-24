-- migration-002.sql — customer accounts: link orders to accounts + own-orders read.
-- Run ONCE in Supabase SQL Editor (or via the Management API query endpoint).
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Customers may read ONLY their own orders (linked at checkout when logged in).
-- Admins already read all orders via "orders admin read". Guest orders (user_id
-- null) stay trackable by phone through the track_orders() function.
drop policy if exists "orders customer read own" on public.orders;
create policy "orders customer read own" on public.orders
  for select using (user_id = auth.uid());
