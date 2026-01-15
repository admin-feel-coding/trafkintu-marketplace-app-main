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
  created_at timestamptz not null default now()
);

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  url text not null,
  sort_order int not null default 1
);

create table if not exists featured_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  pyme_id uuid not null references pymes(id) on delete cascade,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected'))
);

-- 3. Indexes
create index if not exists idx_pymes_owner_id on pymes(owner_id);
create index if not exists idx_listings_pyme_id on listings(pyme_id);
create index if not exists idx_listings_category_id on listings(category_id);
create index if not exists idx_listing_images_listing_id on listing_images(listing_id);
create index if not exists idx_pymes_verification_status on pymes(verification_status);

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
