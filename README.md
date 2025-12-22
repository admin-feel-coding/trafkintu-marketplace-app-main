# TRAFKINTU – Marketplace PYMEs (MVP)

Proyecto Next.js (App Router) con TypeScript, Tailwind y shadcn/ui. Arquitectura por capas: domain (entidades/ports/services), data (repos Supabase + seeds/fallback), features (auth/marketplace/pymes/admin), shared (lib/ui), components.

## Estructura
```
src/
  app/               # Rutas Next.js (App Router)
  domain/            # entities, ports (interfaces), services
  data/
    mock/            # seeds y store en memoria
    repositories/    # Supabase repos (wrappers mantienen imports Mock)
  features/          # auth, marketplace, pymes, admin
  shared/            # lib (env, supabase clients, format), ui
  components/        # ui shared
```
Alias: `@/* -> ./src/*`

## Configuración
Crear `.env.local` en la raíz:
```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
SUPABASE_SERVICE_ROLE_KEY=<service_role>
```

## Supabase
- Clientes: `shared/lib/supabase/{browser,admin}.ts` (browser client; admin client para API interna).
- Repositorios Supabase:
  - `AuthSupabaseRepository`: login/register/logout, cookies trafkintu_role/pyme; crea pyme en Supabase si rol=pyme; fallback local/API interna.
  - `MarketplaceSupabaseRepository`: listados con filtros y join `listing_images`; categorías.
  - `PymeSupabaseRepository`: pymes, listings por pyme, CRUD listings (inserta/actualiza `listing_images`), request featured.
  - `AdminSupabaseRepository`: featured requests, aprobar/rechazar, toggle active (usa admin client).
- Mappers: `data/repositories/supabase/mappers.ts` parsea snake_case, price (JSON), `listing_images` -> `images: string[]`.

## Rutas y features (MVP)
- Home `(marketing)`: destacados, últimas, chips de categorías.
- Explore: búsqueda + filtros (categoría, tipo), ranking (destacados, fecha).
- Listing detail `/listing/[id]`: galería, precio, contacto, pyme.
- Pyme pública `/pyme/[id]`: info pyme, catálogo con filtro Productos/Servicios, contacto.
- Auth `/auth`: login/register (RUT, roles user/pyme).
- Dashboard `/dashboard` (rol pyme): CRUD listings, toggle activo, solicitar destacado.
- Admin `/admin` (rol admin): solicitudes destacado, moderar activo.
- Perfil `/profile`: info pyme, settings, publicaciones.
- Guardias: middleware con cookies rol/pyme para /dashboard, /admin, /profile.

## Estado actual
- Lint OK; build compila (puede aparecer EPIPE en algunos entornos de salida).
- Registro/login con Supabase funciona con env correctas; fallback local/API interna si Supabase no responde.
- Imágenes cargan desde tabla relacional `listing_images` (columna url, sort_order).
- Seeds como fallback si faltan env o Supabase no está disponible.

## Scripts
- `npm run dev`
- `npm run lint`
- `npm run build` (requiere env y conectividad a Supabase)
