# Prompt para Codex (IDE)

## Objetivo

Implementar la integración de pagos para **publicaciones destacadas** en TRAFKINTU con MercadoPago, siguiendo la arquitectura actual (features + domain + data + shared). Los planes son **por post y por días** (7/14/30). Usa el rango de precios accesible.

## Contexto actual

- App Next.js App Router con arquitectura por features (features, domain, data, shared).
- Flujo destacado actual es manual (solicitud + aprobación admin) y sin pago integrado.
- `isFeatured` en `Listing` controla la insignia, sin expiración.
- Datos mock y repositorios mock.

## Requisitos funcionales

1. Agregar planes destacados por **post y por días**:
   - 7 días: $4.990 CLP
   - 14 días: $7.990 CLP
   - 30 días: $12.990 CLP
2. Integrar MercadoPago usando el link:
   - **link.mercadopago.cl/trafkintuapp**
3. Al confirmar pago (aprobado), activar `isFeatured` y establecer `featuredAt` y `featuredUntil`.
4. Al vencer `featuredUntil`, quitar `isFeatured`.
5. Mantener la arquitectura limpia (domain/ports + data/repositories + features/services).

## Cambios técnicos sugeridos

- Crear entidad/VO `FeaturedPlan`.
- Agregar nuevos campos en `Listing` o `FeaturedRequest`:
  - `featuredPlanId`, `featuredAt`, `featuredUntil`, `paymentStatus`, `paymentProviderId`
- Crear `PaymentRepository` en `domain/ports` y su implementación mock.
- Implementar casos de uso en `features/pymes/services`:
  - `requestFeaturedWithPlan`, `confirmPaymentAndActivateFeatured`
- Ajustar UI de solicitud destacado:
  - selector de plan (7/14/30)
  - botón para ir a MercadoPago (link)

## Entregable

- Código actualizado sin romper flujos existentes.
- Mantener copy en español neutro.
- No añadir dependencias innecesarias.
- Incluir mocks para estados de pago.
