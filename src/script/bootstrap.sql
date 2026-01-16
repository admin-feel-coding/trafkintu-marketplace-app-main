-- =========================================
-- TRAFKINTU - BOOTSTRAP (Simple Setup)
-- Run in Supabase SQL Editor
-- =========================================

create extension if not exists "pgcrypto";

-- 1. Enums
do $$ begin
  create type fulfillment_kind as enum ('local', 'delivery', 'both');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type listing_kind as enum ('product', 'service');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type price_kind as enum ('fixed', 'from', 'quote');
exception when duplicate_object then null;
end $$;

-- 2. Tables (pymes references auth.users directly)
create table if not exists pymes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  rut text not null,
  name text not null,
  description text not null default '',
  whatsapp text,
  email text not null default '',
  phone text not null default '',
  address text,
  hours text,
  website text,
  banner_url text,
  avatar_url text,
  fulfillment fulfillment_kind not null default 'both',
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified')),
  verification_requested_at timestamptz,
  verification_verified_at timestamptz,
  verification_note text,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  pyme_id uuid not null references pymes(id) on delete cascade,
  type listing_kind not null,
  category_id uuid not null references categories(id),
  title text not null,
  description text not null default '',
  price_kind price_kind not null default 'quote',
  price_amount numeric,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  featured_at timestamptz,
  featured_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  url text not null,
  sort_order int not null default 1
);

create table if not exists featured_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  days int not null,
  price_clp int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists featured_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  pyme_id uuid not null references pymes(id) on delete cascade,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  plan_id uuid references featured_plans(id),
  plan_days int,
  plan_price_clp int,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','approved','rejected','in_process','cancelled','refunded','charged_back','expired')),
  payment_provider text,
  payment_provider_id text,
  payment_preference_id text,
  payment_init_point text,
  featured_at timestamptz,
  featured_until timestamptz
);

-- 3. Indexes
create index if not exists idx_pymes_owner_id on pymes(owner_id);
create index if not exists idx_listings_pyme_id on listings(pyme_id);
create index if not exists idx_listings_category_id on listings(category_id);
create index if not exists idx_listing_images_listing_id on listing_images(listing_id);
create index if not exists idx_pymes_verification_status on pymes(verification_status);
create index if not exists idx_listings_featured_until on listings(featured_until);
create index if not exists idx_featured_requests_listing_id on featured_requests(listing_id);
create unique index if not exists ux_featured_plans_days on featured_plans(days);

-- Unique constraint: one pyme per user
create unique index if not exists ux_pymes_owner_id on pymes(owner_id);

-- 4. Categories (required data)
insert into categories (name, slug) values
  ('Comida', 'comida'),
  ('Servicios', 'servicios'),
  ('Carpinteria', 'carpinteria'),
  ('Artesania', 'artesania'),
  ('Ropa / Textil', 'ropa-textil'),
  ('Hogar', 'hogar'),
  ('Clases / Talleres', 'clases-talleres'),
  ('Otros', 'otros')
on conflict (slug) do nothing;

insert into featured_plans (name, days, price_clp) values
  ('Destacado 7 dias', 7, 4990),
  ('Destacado 14 dias', 14, 7990),
  ('Destacado 30 dias', 30, 12990)
on conflict (days) do nothing;

-- 5. Featured expiration job (requires pg_cron enabled in Supabase)
create extension if not exists pg_cron;

create or replace function expire_featured_listings() returns void
language plpgsql
as $$
begin
  update listings
  set is_featured = false,
      featured_at = null,
      featured_until = null
  where is_featured = true
    and featured_until is not null
    and featured_until <= now();

  update featured_requests
  set status = 'expired',
      payment_status = 'expired'
  where status = 'approved'
    and featured_until is not null
    and featured_until <= now();
end;
$$;

do $$
begin
  if not exists (select 1 from cron.job where jobname = 'expire_featured_listings') then
    perform cron.schedule('expire_featured_listings', '*/15 * * * *', $$select expire_featured_listings();$$);
  end if;
end $$;
