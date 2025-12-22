-- ==========================
-- TRAFKINTU - SCHEMA MVP
-- ==========================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type public.user_role as enum ('user', 'pyme', 'admin');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.fulfillment_kind as enum ('local', 'delivery', 'both');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.listing_kind as enum ('product', 'service');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.price_kind as enum ('fixed', 'from', 'quote');
exception when duplicate_object then null;
end $$;

-- ---------- Tables ----------
-- profiles (User)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.user_role not null default 'user',
  rut text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- pymes (Pyme)
create table if not exists public.pymes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
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
  fulfillment public.fulfillment_kind not null default 'both',
  created_at timestamptz not null default now()
);

-- categories (Category)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- listings (Listing)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  pyme_id uuid not null references public.pymes(id) on delete cascade,
  type public.listing_kind not null,
  category_id uuid not null references public.categories(id),
  title text not null,
  description text not null default '',
  price_kind public.price_kind not null default 'quote',
  price_amount numeric,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- listing_images
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  sort_order int not null default 1
);

-- featured_requests (Admin queue)
create table if not exists public.featured_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  pyme_id uuid not null references public.pymes(id) on delete cascade,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected'))
);

-- ---------- Indexes ----------
create index if not exists idx_pymes_owner_id on public.pymes(owner_id);
create index if not exists idx_listings_pyme_id on public.listings(pyme_id);
create index if not exists idx_listings_category_id on public.listings(category_id);
create index if not exists idx_listings_rank on public.listings(is_featured desc, created_at desc);
create index if not exists idx_listing_images_listing_id on public.listing_images(listing_id);
create index if not exists idx_featured_requests_status on public.featured_requests(status, requested_at desc);

-- ==========================
-- TRIGGER: create profile on signup
-- Uses user_metadata: rut, display_name, role
-- ==========================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role, rut, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user'),
    coalesce(new.raw_user_meta_data->>'rut', 'PENDIENTE'),
    coalesce(new.raw_user_meta_data->>'display_name', 'Usuario')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ==========================
-- Seed categorías iniciales
-- ==========================

insert into public.categories (name, slug) values
  ('Comida', 'comida'),
  ('Servicios', 'servicios'),
  ('Carpintería', 'carpinteria'),
  ('Artesanía', 'artesania'),
  ('Ropa / Textil', 'ropa-textil'),
  ('Hogar', 'hogar'),
  ('Clases / Talleres', 'clases-talleres'),
  ('Otros', 'otros')
on conflict (slug) do nothing;