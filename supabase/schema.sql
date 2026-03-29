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
-- RLS: allow public (anon) read access (the app uses the publishable/anon key).
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.clients enable row level security;
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
commit;