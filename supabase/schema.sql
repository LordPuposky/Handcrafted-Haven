-- Handcrafted Haven (Supabase) schema
--
-- This file matches the TypeScript model in `src/data/marketplace.ts`.
-- IMPORTANT: Column names use camelCase (quoted) because the app does `select("*")`
-- and expects keys like `sellerId`, `avatarEmoji`, etc.
begin;
-- Sellers
create table if not exists public.sellers (
  id text primary key,
  name text not null,
  location text not null,
  specialty text not null,
  bio text not null,
  story text not null,
  "avatarEmoji" text not null
);
-- Products
create table if not exists public.products (
  id text primary key,
  "sellerId" text not null references public.sellers(id) on delete cascade,
  title text not null,
  category text not null,
  description text not null,
  price numeric not null check (price >= 0),
  "imageEmoji" text not null,
  featured boolean not null default false,
  constraint products_category_check check (
    category in (
      'Decor',
      'Accessories',
      'Ceramics',
      'Textile',
      'Stationery'
    )
  )
);
create index if not exists products_seller_id_idx on public.products ("sellerId");
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_category_idx on public.products (category);
-- Reviews
create table if not exists public.reviews (
  id text primary key,
  "productId" text not null references public.products(id) on delete cascade,
  author text not null,
  rating int not null check (
    rating >= 1
    and rating <= 5
  ),
  comment text not null
);
create index if not exists reviews_product_id_idx on public.reviews ("productId");
-- Clients (buyer accounts tied to Supabase Auth users)
create table if not exists public.clients (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  "avatarEmoji" text not null default '👤',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists clients_email_idx on public.clients (email);
-- Orders
create table if not exists public.orders (
  id text primary key,
  "clientId" uuid not null references public.clients(id) on delete cascade,
  status text not null default 'pending',
  subtotal numeric not null check (subtotal >= 0),
  shipping numeric not null default 0 check (shipping >= 0),
  tax numeric not null default 0 check (tax >= 0),
  total numeric not null check (total >= 0),
  currency text not null default 'BRL',
  "shippingName" text not null,
  "shippingEmail" text not null,
  "shippingAddress" text not null,
  "shippingCity" text not null,
  "shippingState" text not null,
  "shippingPostalCode" text not null,
  notes text,
  "createdAt" timestamptz not null default now(),
  constraint orders_status_check check (status in ('pending', 'confirmed', 'cancelled'))
);
create index if not exists orders_client_id_idx on public.orders ("clientId");
create index if not exists orders_created_at_idx on public.orders ("createdAt");
-- Order Items
create table if not exists public.order_items (
  id text primary key,
  "orderId" text not null references public.orders(id) on delete cascade,
  "productId" text not null references public.products(id),
  title text not null,
  "unitPrice" numeric not null check ("unitPrice" >= 0),
  quantity int not null check (quantity > 0),
  "lineTotal" numeric not null check ("lineTotal" >= 0)
);
create index if not exists order_items_order_id_idx on public.order_items ("orderId");
create index if not exists order_items_product_id_idx on public.order_items ("productId");
-- Keep public.clients in sync with auth.users
create or replace function public.handle_client_profile() returns trigger language plpgsql security definer
set search_path = public as $$ begin
insert into public.clients (id, name, email)
values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1),
      'User'
    ),
    new.email
  ) on conflict (id) do
update
set name = excluded.name,
  email = excluded.email,
  "updatedAt" = now();
return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_client_profile();
insert into public.clients (id, name, email)
select users.id,
  coalesce(
    users.raw_user_meta_data->>'full_name',
    split_part(users.email, '@', 1),
    'User'
  ),
  users.email
from auth.users as users on conflict (id) do
update
set name = excluded.name,
  email = excluded.email,
  "updatedAt" = now();
-- Enable RLS
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.clients enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
-- Public read policies
do $$ begin if not exists (
  select 1
  from pg_policies
  where schemaname = 'public'
    and tablename = 'sellers'
    and policyname = 'public read'
) then create policy "public read" on public.sellers for
select using (true);
end if;
if not exists (
  select 1
  from pg_policies
  where schemaname = 'public'
    and tablename = 'products'
    and policyname = 'public read'
) then create policy "public read" on public.products for
select using (true);
end if;
if not exists (
  select 1
  from pg_policies
  where schemaname = 'public'
    and tablename = 'reviews'
    and policyname = 'public read'
) then create policy "public read" on public.reviews for
select using (true);
end if;
if not exists (
  select 1
  from pg_policies
  where schemaname = 'public'
    and tablename = 'clients'
    and policyname = 'clients can read own profile'
) then create policy "clients can read own profile" on public.clients for
select to authenticated using (auth.uid() = id);
end if;
if not exists (
  select 1
  from pg_policies
  where schemaname = 'public'
    and tablename = 'clients'
    and policyname = 'clients can insert own profile'
) then create policy "clients can insert own profile" on public.clients for
insert to authenticated with check (auth.uid() = id);
end if;
if not exists (
  select 1
  from pg_policies
  where schemaname = 'public'
    and tablename = 'clients'
    and policyname = 'clients can update own profile'
) then create policy "clients can update own profile" on public.clients for
update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
end if;
end $$;
-- Recreate order policies deterministically
drop policy if exists "clients can read own orders" on public.orders;
create policy "clients can read own orders" on public.orders for
select to authenticated using (auth.uid() = "clientId");
drop policy if exists "clients can insert own orders" on public.orders;
create policy "clients can insert own orders" on public.orders for
insert to authenticated with check (
    auth.uid() is not null
    and auth.uid() = "clientId"
  );
drop policy if exists "clients can read own order items" on public.order_items;
create policy "clients can read own order items" on public.order_items for
select to authenticated using (
    exists (
      select 1
      from public.orders
      where public.orders.id = "orderId"
        and public.orders."clientId" = auth.uid()
    )
  );
drop policy if exists "clients can insert own order items" on public.order_items;
create policy "clients can insert own order items" on public.order_items for
insert to authenticated with check (
    exists (
      select 1
      from public.orders
      where public.orders.id = "orderId"
        and public.orders."clientId" = auth.uid()
    )
  );
commit;