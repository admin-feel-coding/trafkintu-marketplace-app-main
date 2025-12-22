-- ============================================
-- TRAFKINTU - DEV SEED (requires profiles exist)
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
    when 'carpinteria@trafkintu.dev' then 'Carpintería El Roble'
    when 'panaderia@trafkintu.dev' then 'Panadería Don Pepe'
    when 'artesanias@trafkintu.dev' then 'Artesanías Ñuke'
  end as name,
  case o.email
    when 'carpinteria@trafkintu.dev' then 'Muebles y trabajos en madera maciza hechos a mano.'
    when 'panaderia@trafkintu.dev' then 'Panadería artesanal con recetas tradicionales.'
    when 'artesanias@trafkintu.dev' then 'Artesanía mapuche hecha a mano con identidad local.'
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
  'Lun a Sáb 09:00 - 19:00' as hours,
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

-- 2A) Carpintería listings
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
  ('product', 'Repisa flotante', 'Repisa minimalista, varios tamaños.', 'from', 25000::numeric, false),
  ('service', 'Restauración de muebles', 'Servicio de restauración y barnizado.', 'quote', null::numeric, false)
) as x(type, title, description, price_kind, price_amount, is_featured)
  on p.pyme_name = 'Carpintería El Roble'
on conflict (pyme_id, title) do update set
  type = excluded.type,
  category_id = excluded.category_id,
  description = excluded.description,
  price_kind = excluded.price_kind,
  price_amount = excluded.price_amount,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured;

-- 2B) Panadería listings
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
  ('product', 'Pan amasado tradicional', 'Pan amasado recién horneado todos los días.', 'fixed', 2000::numeric, true),
  ('product', 'Kuchen de frambuesa', 'Kuchen casero por porción o entero.', 'from', 3500::numeric, false),
  ('service', 'Tortas a pedido', 'Cotiza tu torta personalizada.', 'quote', null::numeric, false)
) as x(type, title, description, price_kind, price_amount, is_featured)
  on p.pyme_name = 'Panadería Don Pepe'
on conflict (pyme_id, title) do update set
  type = excluded.type,
  category_id = excluded.category_id,
  description = excluded.description,
  price_kind = excluded.price_kind,
  price_amount = excluded.price_amount,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured;

-- 2C) Artesanías listings
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
  ('product', 'Pulsera tejida', 'Pulsera artesanal con colores a elección.', 'fixed', 8000::numeric, false)
) as x(type, title, description, price_kind, price_amount, is_featured)
  on p.pyme_name = 'Artesanías Ñuke'
on conflict (pyme_id, title) do update set
  type = excluded.type,
  category_id = excluded.category_id,
  description = excluded.description,
  price_kind = excluded.price_kind,
  price_amount = excluded.price_amount,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured;

-- 3) Imágenes (1 por listing) - idempotente
insert into public.listing_images (listing_id, url, sort_order)
select l.id, img.url, 1
from public.listings l
join (values
  ('Mesa de madera maciza', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=60'),
  ('Repisa flotante', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=60'),
  ('Restauración de muebles', 'https://images.unsplash.com/photo-1581579185169-6d1f39d059fd?auto=format&fit=crop&w=1200&q=60'),
  ('Pan amasado tradicional', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=60'),
  ('Kuchen de frambuesa', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=60'),
  ('Tortas a pedido', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9f?auto=format&fit=crop&w=1200&q=60'),
  ('Trarilonco artesanal', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=60'),
  ('Aros de plata', 'https://images.unsplash.com/photo-1601121141461-9d6643f5c6c5?auto=format&fit=crop&w=1200&q=60'),
  ('Pulsera tejida', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=1200&q=60')
) as img(title, url)
  on img.title = l.title
on conflict (listing_id, url) do nothing;