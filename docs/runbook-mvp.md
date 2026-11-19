# Runbook MVP — piloto en campo

Checklist operativo cuando algo falla en staging/producción.

## 1. Health y base de datos

1. `GET /api/v1/health` debe responder `200` con `"db": "ok"`.
2. Si `503`: revisar `POSTGRES_URL` en Vercel y que `npm run vercel-build` haya ejecutado `prisma db push`.
3. Rescate manual: [`prisma/sql/sync_schema_operativo.sql`](../prisma/sql/sync_schema_operativo.sql).

## 2. Login transportista devuelve 401 en listados

- La API Key **cambia en cada login**. Tras login, usar la key del JSON o `localStorage` `rutasegura_admin_user`.
- Verificar header `X-API-Key` o `Authorization: Bearer`.

## 3. GPS / location sin efecto

- Viaje debe estar `EN_CURSO`.
- Transportista debe ser dueño de la ruta (403 si no).
- Throttle: máximo ~1 POST cada 2 s por viaje (429 si es más rápido).
- Umbrales: `GPS_UMBRAL_EN_CAMINO_METROS` (default 400), `GPS_UMBRAL_EN_PUERTA_METROS` (default 80).

## 4. FCM sin push en dispositivo

- Sin `FCM_SERVER_KEY`: las notificaciones solo se guardan en `NotificacionLog` (estado `ENVIADO` en MVP).
- Con key: el contacto necesita `fcmToken` en `ContactoNotificacion`.
- Revisar panel `/notifications` y estado `FALLIDO`.

## 5. Schema desfasado en prod

Síntoma: 500 en Prisma (`column does not exist`).

1. Redeploy con `vercel-build` (incluye `db push`).
2. O ejecutar SQL de sincronización en la BD.
3. Regenerar cliente: `npx prisma generate` en CI.

## 6. Seed en staging

- Demo destructivo (local): `npx prisma db seed`.
- Staging con datos reales: `PRISMA_SEED_DESTRUCTIVE=false npx prisma db seed` (solo inserta si no hay admin).

## Credenciales demo

| Usuario | Contraseña |
|---------|------------|
| admin@rutasegura.com | admin123 |
| maria.gonzalez@example.com | driver123 |
| juan.perez@example.com | driver123 |
| carlos.vega@example.com | driver123 |