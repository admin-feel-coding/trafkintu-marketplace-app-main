Contexto general del proyecto

Estás trabajando sobre el proyecto TRAFKINTU, una app web construida con:

Next.js App Router

TypeScript

Tailwind CSS

shadcn/ui

Arquitectura Clean Architecture / Hexagonal

Separación clara entre domain, data, features, shared

La app actualmente funciona con repositorios mock (in-memory + seeds), y ahora debe migrar a Supabase como backend real, sin romper contratos de dominio ni la UI existente.

Estructura actual del proyecto (importante)
src/
 ├─ app/                  # Next.js App Router
 ├─ domain/
 │   ├─ entities/
 │   ├─ ports/            # Interfaces (NO modificar)
 │   └─ services/
 ├─ data/
 │   ├─ mock/             # Repositorios mock existentes
 │   └─ repositories/     # Aquí deben ir los repos Supabase
 ├─ features/
 │   ├─ auth/
 │   ├─ marketplace/
 │   ├─ pymes/
 │   └─ admin/
 ├─ shared/
 │   ├─ lib/
 │   │   ├─ env.ts        # Ya existe, lee env vars
 │   │   └─ (supabase)    # Aquí crear clientes Supabase
 └─ components/


Alias configurado:

@/*  ->  ./src/*

Objetivo principal

👉 Reemplazar los repositorios mock por repositorios Supabase, implementando exactamente las interfaces existentes en:

AuthRepository

MarketplaceRepository

PymeRepository

AdminRepository

❗ NO modificar las interfaces
❗ NO modificar entidades de dominio
❗ NO modificar la UI

Variables de entorno disponibles

Ya existen en .env.local:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # publishable key
SUPABASE_SERVICE_ROLE_KEY=...            # secret key (server only)


Y se acceden desde:

import { env } from "@/shared/lib/env"

Parte 1 — Crear clientes Supabase

Crear los siguientes archivos:

src/shared/lib/supabase/browser.ts

Usa @supabase/supabase-js

Usa NEXT_PUBLIC_SUPABASE_URL

Usa NEXT_PUBLIC_SUPABASE_ANON_KEY

Pensado para componentes y hooks del frontend

src/shared/lib/supabase/server.ts

Usa @supabase/ssr

Integra cookies con next/headers

Debe funcionar en:

Server Components

Server Actions

Route Handlers

src/shared/lib/supabase/admin.ts

Usa SUPABASE_SERVICE_ROLE_KEY

Solo para operaciones admin

persistSession: false

Parte 2 — Helpers de seguridad (server-only)

Crear:

src/shared/lib/auth/requireUser.ts

Server-only

Obtiene el usuario autenticado desde Supabase

Lee profiles

Devuelve un objeto User que cumple exactamente con:

export interface User {
  id: string
  email: string
  role: "user" | "pyme" | "admin"
  rut: string
  displayName: string
  pymeId?: string
}

src/shared/lib/auth/requireAdmin.ts

Usa requireUser

Lanza error si role !== "admin"

Parte 3 — Mappers DB → Domain

Crear:

src/data/repositories/supabase/mappers.ts

Funciones puras:

mapListing(row): Listing

mapPyme(row): Pyme

mapCategory(row): Category

Respetar estrictamente las entidades:

Listing

Pyme

Category

Convertir:

snake_case → camelCase

created_at → Date

listing_images → images: string[]

Parte 4 — Repositorios Supabase (núcleo)

Crear en:

src/data/repositories/supabase/

1️⃣ AuthSupabaseRepository.ts

Debe implementar exactamente:

AuthRepository


Responsabilidades:

login

register

getCurrentUser

logout

Detalles:

Usar user_metadata para rut, display_name, role

Al registrar una pyme:

crear registro en tabla pymes

Sincronizar cookies:

trafkintu_role

trafkintu_pyme
(para compatibilidad con middleware actual)

2️⃣ MarketplaceSupabaseRepository.ts

Implementa:

MarketplaceRepository


Funciones:

getListings(filters)

getListingById

getCategories

Requisitos:

Filtros por:

categoría

tipo

búsqueda textual (ilike)

activos

destacados

Orden:

is_featured desc

created_at desc

3️⃣ PymeSupabaseRepository.ts

Implementa:

PymeRepository


Funciones:

getPymeById

getListingsByPymeId

createListing

updateListing

toggleListingActive

requestFeatured

updatePyme

Reglas:

Validar ownership usando requireUser

Las imágenes se guardan como URLs en listing_images

requestFeatured crea registro en featured_requests

Evitar requests duplicadas pendientes

4️⃣ AdminSupabaseRepository.ts

Implementa:

AdminRepository


Funciones:

getFeaturedRequests

approveFeaturedRequest

rejectFeaturedRequest

toggleListingActive

Reglas:

Validar admin con requireAdmin

Usar service role client para escrituras críticas

Al aprobar:

marcar listings.is_featured = true

actualizar estado de la request

Parte 5 — Integración final

NO tocar UI

NO tocar hooks existentes

Reemplazar instancias de repos mock por Supabase repos

Mantener el mismo shape de datos

Mantener compatibilidad con middleware actual

Restricciones importantes

❌ No introducir lógica en componentes UI
❌ No usar any innecesariamente
❌ No romper contratos de dominio
❌ No mover archivos fuera de la estructura indicada

✅ Código limpio
✅ Tipado estricto
✅ Server / client bien separados

Resultado esperado

Al finalizar:

La app debe funcionar igual que antes

Pero ahora con Supabase real

Listados, pymes, auth y admin operativos

Sin retrabajo futuro