-- =========================================
-- TRAFKINTU - STORAGE SETUP
-- Run in Supabase SQL Editor AFTER bootstrap.sql
-- =========================================

-- 1. Create bucket for listing images (public read)
insert into storage.buckets (id, name, public)
values ('TRAFKINTU', 'TRAFKINTU', true)
on conflict (id) do nothing;

-- 2. Drop existing policies (for clean re-run)
drop policy if exists "Public read access for TRAFKINTU" on storage.objects;
drop policy if exists "Pyme owners can upload to TRAFKINTU" on storage.objects;
drop policy if exists "Pyme owners can update own TRAFKINTU images" on storage.objects;
drop policy if exists "Pyme owners can delete own TRAFKINTU images" on storage.objects;

-- 3. Storage policies
create policy "Public read access for TRAFKINTU"
on storage.objects for select
using (bucket_id = 'TRAFKINTU');

create policy "Pyme owners can upload to TRAFKINTU"
on storage.objects for insert
with check (
  bucket_id = 'TRAFKINTU'
  and auth.role() = 'authenticated'
  and exists (
    select 1 from pymes p
    where p.owner_id = auth.uid()
  )
);

create policy "Pyme owners can update own TRAFKINTU images"
on storage.objects for update
using (
  bucket_id = 'TRAFKINTU'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Pyme owners can delete own TRAFKINTU images"
on storage.objects for delete
using (
  bucket_id = 'TRAFKINTU'
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);
