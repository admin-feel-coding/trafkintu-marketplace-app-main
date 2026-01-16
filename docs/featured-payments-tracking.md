# Seguimiento de pagos destacados

Estado: en progreso

Alcance:
- Planes destacados persistidos en Supabase.
- Preferencia MercadoPago + webhook via Supabase Edge Functions.
- Activacion automatica + expiracion de destacados.
- Vista de auditoria en admin.

Flujo explicado:
- `create-featured-payment`: se llama desde el frontend cuando el usuario elige plan; crea la solicitud destacada, genera la preferencia en MercadoPago y devuelve `init_point` para redirigir al checkout.
- `mp-webhook`: lo llama MercadoPago despues del pago; valida la firma, consulta el pago, actualiza estados y activa/desactiva el destacado segun el resultado.
- `pg_cron`: ejecuta expiracion automatica de destacados vencidos cada 15 minutos.

Checklist:
- [x] Esquema BD para planes, solicitudes y metadatos de destacado.
- [x] Edge Function create-featured-payment.
- [x] Edge Function mp-webhook con validacion de firma.
- [x] Selector de plan + redireccion a MercadoPago.
- [x] Tabla de auditoria admin para pagos y estados.
- [ ] Secrets de Supabase configurados en el proyecto.
- [ ] Edge Functions desplegadas.
- [ ] Webhook configurado en panel MercadoPago.
- [ ] pg_cron habilitado y programado.

Notas:
- Webhook URL: https://<project>.supabase.co/functions/v1/mp-webhook
- Nombres de funciones: create-featured-payment, mp-webhook
- SQL bootstrap: src/script/bootstrap.sql
