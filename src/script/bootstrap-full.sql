-- =========================================
-- TRAFKINTU - FULL BOOTSTRAP (schema + seed)
-- Runs in Supabase SQL editor.
-- Creates schema, inserts auth users (with profiles), and seeds demo data.
-- =========================================

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
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.user_role not null default 'user',
  rut text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

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

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

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

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  sort_order int not null default 1
);

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
-- Seed categorias iniciales
-- ==========================

insert into public.categories (name, slug) values
  ('Comida', 'comida'),
  ('Servicios', 'servicios'),
  ('Carpinteria', 'carpinteria'),
  ('Artesania', 'artesania'),
  ('Ropa / Textil', 'ropa-textil'),
  ('Hogar', 'hogar'),
  ('Clases / Talleres', 'clases-talleres'),
  ('Otros', 'otros')
on conflict (slug) do nothing;

-- ==========================
-- Bootstrap auth users (profiles via trigger)
-- ==========================

with seed_users as (
  select * from (values
    ('panaderia@trafkintu.dev', 'Panaderia Don Pepe', '11111111-1', 'pyme', 'ChangeMe123!'),
    ('artesanias@trafkintu.dev', 'Artesanias Nuke', '22222222-2', 'pyme', 'ChangeMe123!'),
    ('carpinteria@trafkintu.dev', 'Carpinteria El Roble', '33333333-3', 'pyme', 'ChangeMe123!')
  ) as v(email, display_name, rut, role, password)
)
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  v.email,
  crypt(v.password, gen_salt('bf')),
  now(),
  jsonb_build_object(
    'display_name', v.display_name,
    'rut', v.rut,
    'role', v.role
  ),
  jsonb_build_object(
    'provider', 'email',
    'providers', array['email']
  ),
  now(),
  now()
from seed_users v
on conflict (email) do update
  set raw_user_meta_data = excluded.raw_user_meta_data,
      encrypted_password = excluded.encrypted_password,
      raw_app_meta_data = excluded.raw_app_meta_data,
      updated_at = now();

-- ============================================
-- Demo seed data (idempotent)
-- ============================================

-- 0) Indexes para que sea idempotente
create unique index if not exists ux_pymes_owner_id on public.pymes(owner_id);
create unique index if not exists ux_listings_pyme_title on public.listings(pyme_id, title);
create unique index if not exists ux_listing_images_listing_url on public.listing_images(listing_id, url);

-- 1) Crear/actualizar pymes asociadas a profiles existentes por email
with owners as (
  select id, email
  from public.profiles
  where email in ('panaderia@trafkintu.dev', 'artesanias@trafkintu.dev', 'carpinteria@trafkintu.dev')
)
insert into public.pymes (
  owner_id, name, description, whatsapp, email, phone, address, hours, website, banner_url, avatar_url, fulfillment
)
select
  o.id,
  case o.email
    when 'carpinteria@trafkintu.dev' then 'Carpinteria El Roble'
    when 'panaderia@trafkintu.dev' then 'Panaderia Don Pepe'
    when 'artesanias@trafkintu.dev' then 'Artesanias Nuke'
  end as name,
  case o.email
    when 'carpinteria@trafkintu.dev' then 'Muebles y trabajos en madera maciza hechos a mano.'
    when 'panaderia@trafkintu.dev' then 'Panaderia artesanal con recetas tradicionales.'
    when 'artesanias@trafkintu.dev' then 'Artesania mapuche hecha a mano con identidad local.'
  end as description,
  case o.email
    when 'carpinteria@trafkintu.dev' then '+56911111111'
    when 'panaderia@trafkintu.dev' then '+56922222222'
    when 'artesanias@trafkintu.dev' then '+56933333333'
  end as whatsapp,
  o.email,
  case o.email
    when 'carpinteria@trafkintu.dev' then '+56911111111'
    when 'panaderia@trafkintu.dev' then '+56922222222'
    when 'artesanias@trafkintu.dev' then '+56933333333'
  end as phone,
  case o.email
    when 'carpinteria@trafkintu.dev' then 'Temuco, Chile'
    when 'panaderia@trafkintu.dev' then 'Padre Las Casas, Chile'
    when 'artesanias@trafkintu.dev' then 'Nueva Imperial, Chile'
  end as address,
  'Lun a Sab 09:00 - 19:00' as hours,
  null as website,
  case o.email
    when 'carpinteria@trafkintu.dev' then 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=60'
    when 'panaderia@trafkintu.dev' then 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1600&q=60'
    when 'artesanias@trafkintu.dev' then 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?auto=format&fit=crop&w=1600&q=60'
  end as banner_url,
  case o.email
    when 'carpinteria@trafkintu.dev' then 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d1?auto=format&fit=crop&w=800&q=60'
    when 'panaderia@trafkintu.dev' then 'https://images.unsplash.com/photo-1542831371-d531d36971e6?auto=format&fit=crop&w=800&q=60'
    when 'artesanias@trafkintu.dev' then 'https://images.unsplash.com/photo-1520975922284-7b958f5c7b0b?auto=format&fit=crop&w=800&q=60'
  end as avatar_url,
  case o.email
    when 'carpinteria@trafkintu.dev' then 'local'::public.fulfillment_kind
    when 'panaderia@trafkintu.dev' then 'local'::public.fulfillment_kind
    when 'artesanias@trafkintu.dev' then 'delivery'::public.fulfillment_kind
  end as fulfillment
from owners o
on conflict (owner_id) do update set
  name = excluded.name,
  description = excluded.description,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  phone = excluded.phone,
  address = excluded.address,
  hours = excluded.hours,
  banner_url = excluded.banner_url,
  avatar_url = excluded.avatar_url,
  fulfillment = excluded.fulfillment;

-- 2A) Carpinteria listings
with p as (
  select id as pyme_id, name as pyme_name
  from public.pymes
)
insert into public.listings (pyme_id, type, category_id, title, description, price_kind, price_amount, is_active, is_featured)
select
  p.pyme_id,
  x.type::public.listing_kind,
  c.id,
  x.title,
  x.description,
  x.price_kind::public.price_kind,
  x.price_amount,
  true,
  x.is_featured
from p
join public.categories c on c.slug = 'carpinteria'
join (values
  ('product', 'Mesa de madera maciza', 'Mesa artesanal de roble, ideal para comedor.', 'fixed', 180000::numeric, true),
  ('product', 'Repisa flotante', 'Repisa minimalista, varios tamanos.', 'from', 25000::numeric, false),
  ('service', 'Restauracion de muebles', 'Servicio de restauracion y barnizado.', 'quote', null::numeric, false)
) as x(type, title, description, price_kind, price_amount, is_featured)
  on p.pyme_name = 'Carpinteria El Roble'
on conflict (pyme_id, title) do update set
  type = excluded.type,
  category_id = excluded.category_id,
  description = excluded.description,
  price_kind = excluded.price_kind,
  price_amount = excluded.price_amount,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured;

-- 2B) Panaderia listings
with p as (
  select id as pyme_id, name as pyme_name
  from public.pymes
)
insert into public.listings (pyme_id, type, category_id, title, description, price_kind, price_amount, is_active, is_featured)
select
  p.pyme_id,
  x.type::public.listing_kind,
  c.id,
  x.title,
  x.description,
  x.price_kind::public.price_kind,
  x.price_amount,
  true,
  x.is_featured
from p
join public.categories c on c.slug = 'comida'
join (values
  ('product', 'Pan amasado tradicional', 'Pan amasado recien horneado todos los dias.', 'fixed', 2000::numeric, true),
  ('product', 'Kuchen de frambuesa', 'Kuchen casero por porcion o entero.', 'from', 3500::numeric, false),
  ('service', 'Tortas a pedido', 'Cotiza tu torta personalizada.', 'quote', null::numeric, false)
) as x(type, title, description, price_kind, price_amount, is_featured)
  on p.pyme_name = 'Panaderia Don Pepe'
on conflict (pyme_id, title) do update set
  type = excluded.type,
  category_id = excluded.category_id,
  description = excluded.description,
  price_kind = excluded.price_kind,
  price_amount = excluded.price_amount,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured;

-- 2C) Artesanias listings
with p as (
  select id as pyme_id, name as pyme_name
  from public.pymes
)
insert into public.listings (pyme_id, type, category_id, title, description, price_kind, price_amount, is_active, is_featured)
select
  p.pyme_id,
  x.type::public.listing_kind,
  c.id,
  x.title,
  x.description,
  x.price_kind::public.price_kind,
  x.price_amount,
  true,
  x.is_featured
from p
join public.categories c on c.slug = 'artesania'
join (values
  ('product', 'Trarilonco artesanal', 'Trarilonco mapuche hecho a mano.', 'from', 35000::numeric, false),
  ('product', 'Aros de plata', 'Aros hechos a mano (par).', 'fixed', 18000::numeric, true),
  ('product', 'Pulsera tejida', 'Pulsera artesanal con colores a eleccion.', 'fixed', 8000::numeric, false)
) as x(type, title, description, price_kind, price_amount, is_featured)
  on p.pyme_name = 'Artesanias Nuke'
on conflict (pyme_id, title) do update set
  type = excluded.type,
  category_id = excluded.category_id,
  description = excluded.description,
  price_kind = excluded.price_kind,
  price_amount = excluded.price_amount,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured;

-- 3) Imagenes (1 por listing) - idempotente
insert into public.listing_images (listing_id, url, sort_order)
select l.id, img.url, 1
from public.listings l
join (values
  ('Mesa de madera maciza', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=60'),
  ('Repisa flotante', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=60'),
  ('Restauracion de muebles', 'https://images.unsplash.com/photo-1581579185169-6d1f39d059fd?auto=format&fit=crop&w=1200&q=60'),
  ('Pan amasado tradicional', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=60'),
  ('Kuchen de frambuesa', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=60'),
  ('Tortas a pedido', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9f?auto=format&fit=crop&w=1200&q=60'),
  ('Trarilonco artesanal', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=60'),
  ('Aros de plata', 'https://images.unsplash.com/photo-1601121141461-9d6643f5c6c5?auto=format&fit=crop&w=1200&q=60'),
  ('Pulsera tejida', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=60')
) as img(title, url)
  on img.title = l.title
on conflict (listing_id, url) do nothing;
