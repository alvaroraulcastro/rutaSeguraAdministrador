# AGENTS.md — RutaSegura Admin (Web + API)

Guía para asistentes de código en este repositorio: **panel Next.js (App Router)** + **API REST** `/api/v1` en el mismo proyecto.

Prioridad de verdad: **código** → `docs/documentacion_endpoints.md` → este archivo → `README.md`. `docs/estado-proyecto.md` es histórico.

## Stack (versiones en `package.json`)

- **Next.js** 16.x — `build` = `next build --webpack` (no quitar `--webpack`: Prisma + `pg` no compatible con Turbopack build por defecto).
- **React** 19.x · **Ant Design** 6.x · **Tailwind** 4.x
- **PostgreSQL** + **Prisma** 7.x (`@prisma/adapter-pg`, `pg`)
- **Zod** 4.x · **Auth:** API Key (hash en `Usuario.apiKey`)
- **Mapas:** Leaflet / react-leaflet (SSR off con `dynamic`)

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # o editar .env existente
# Completar POSTGRES_URL o DATABASE_URL
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

- URL app: `http://localhost:3000`
- Demo admin: `admin@rutasegura.com` / `admin123` — transportistas: `*@example.com` / `driver123` (ver `docs/datos-demo-ficticios.md`)
- Prisma URL: `prisma.config.ts` carga `.env` y `.env.local` (override).
- Seed: `prisma/seed.ts` + datos en `prisma/seed-data.ts`; env del seed vía `prisma/loadSeedEnv.ts`. Sin URL → mensaje claro y exit 1. `PRISMA_SEED_DESTRUCTIVE=false` omite `deleteMany` si ya hay admin.

## Comandos

| Comando | Uso |
|---------|-----|
| `npm run dev` | Desarrollo |
| `npm run build` | `prisma generate && next build --webpack` |
| `npm run vercel-build` | `prisma generate && prisma db push && next build --webpack` |
| `npm run start` | Producción local |
| `npm run lint` | ESLint |
| `npm run smoke` | `tsx scripts/smoke-lib.mjs` + `smoke-api.mjs` (`BASE_URL` opcional) |
| `npx prisma studio` | GUI DB |
| `npx prisma db seed` | Demo ficticio |

Tras `schema.prisma`: `npx prisma generate` antes de confiar en TypeScript o `npm run build`.

## Autenticación

1. `POST /api/v1/auth/login` → `{ user, apiKey }` — **nueva key cada login** (hash en DB).
2. Headers: `X-API-Key` o `Authorization: Bearer` — en handlers nuevos usar `getApiKeyFromRequest`.
3. Cliente: `localStorage` `rutasegura_admin_user` (`AuthContext`).
4. UI pública: `/login`, `/register`, `/forgot-password`; resto `AuthGate`.
5. UI solo `ADMIN`: `/drivers`, `/settings`.

Roles: `ADMIN` | `TRANSPORTISTA`. Filtro `transportistaId` en pasajeros, rutas, viajes, dashboard, etc.

## API — código y convenciones

- Handlers: `src/app/api/v1/**/route.ts`
- Zod: `src/lib/schemas/*`
- Auth: `src/lib/auth.ts` (`validarApiKey`, `toUsuarioPublico`, `getApiKeyFromRequest`)
- Prisma: `src/lib/prisma.ts` — `runtime: 'nodejs'`, adapter `pg`
- CORS móvil: `src/lib/cors.ts` + `OPTIONS` donde aplique
- Logs: `src/lib/logger.ts` — no secretos

```ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // si usa Prisma
```

Validar API key al inicio (401). Body con Zod (400 + `issues`). Errores operativos: `{ error: string }`.

### Módulos REST

| Módulo | Ruta base | Notas |
|--------|-----------|--------|
| Sistema | `/api/v1/health`, `/config/operativa` | `health` público en proxy |
| Auth | `/api/v1/auth/*` | `profile` = **PATCH** |
| Pasajeros | `/api/v1/pasajeros` | `PATCH [id]` activo; contactos con `fcmToken` opcional |
| Rutas / paradas | `/api/v1/rutas`, `.../paradas` | `PUT` paradas = reordenar |
| Viajes | `/api/v1/viajes`, `/viajes/hoy`, `[id]/location` | Ownership: `viajeAutorizacion.ts`; location 429 rate limit |
| Transportistas | `/api/v1/transportistas` | Solo GET, sin password/apiKey |
| Notificaciones | `/api/v1/notificaciones`, `count` | Listado principal filtra PUSH |
| Dashboard | `/api/v1/dashboard/resumen` | Incluye `posicionesEnCurso` para mapa |
| Reportes | `/api/v1/reportes/operacion` | `dias` 1–90 |

Contrato: `docs/documentacion_endpoints.md`.

## Lógica operativa (GPS y notificaciones)

| Archivo | Rol |
|---------|-----|
| `procesarUbicacionViaje.ts` | Motor: parada actual, completar viaje, coordenadas ida/vuelta |
| `geo.ts` | Haversine |
| `configOperativa.ts` | Umbrales env: `GPS_UMBRAL_*` |
| `plantillasNotificacion.ts` | Textos ES por tipo |
| `tiposNotificacion.ts` | `EN_CAMINO`, `EN_PUERTA`, `LLEGADA_DESTINO` |
| `notificaciones.ts` | Idempotencia + `registrarYEnviarNotificacion` |
| `fcm.ts` | FCM legacy si `FCM_SERVER_KEY` + `fcmToken` en contacto |
| `rateLimitUbicacion.ts` | Throttle ~2 s por `viajeId` (memoria; MVP) |
| `fechaChile.ts` | `viajes/hoy` |
| `viajeAutorizacion.ts` | Transportista solo sus viajes |

Modelo `Viaje`: `ultimaLat`, `ultimaLng`, `ultimaUbicacionEn`, `paradaActualOrden`. `ContactoNotificacion.fcmToken` opcional.

Sin FCM: persistir `NotificacionLog` y log en consola.

## Proxy (`src/proxy.ts`)

Rutas **sin** API Key en proxy (lista en archivo; mantener alineada):

- `/api/v1/auth/login`, `/auth/register`, `/api/v1/health`

El proxy solo exige **presencia** de key; `validarApiKey` en handler. No añade CORS.

## Frontend — patrones

- `AppProviders`: AntdRegistry, `ConfigProvider` `es_ES`, `App` (messages/notifications).
- `MainLayout`: menú, breadcrumbs, `router.push`.
- Páginas: `PageHeader`, `StatCard`, `PageLoading`; API con `getApiUrl` + `useAuth().user.apiKey`.
- Dashboard mapa: `components/dashboard/DashboardViajesMap.tsx` (dynamic, no SSR).
- Viajes UI: crear viaje modal en `ViajesClient.tsx`; usar `App.useApp()` para `message` (dentro de `AppProviders`).
- Reportes: export CSV en cliente desde datos de `reportes/operacion`.
- Settings: lectura de `GET /config/operativa` (no persiste umbrales en DB aún).

Leaflet: import CSS; `dynamic(..., { ssr: false })` en mapas.

UI y errores API en **español**.

## Base de datos

- Schema: `prisma/schema.prisma`
- Índices: `Viaje(estado,fecha)`, `Pasajero(transportistaId)`, `NotificacionLog(enviadoEn)`
- Seed destructivo por defecto; catálogo `prisma/seed-data.ts`
- Rescate prod: `prisma/sql/sync_schema_operativo.sql`
- Migraciones versionadas: ver `docs/prisma-migrate.md` (hoy `db push` en Vercel)

Entidades: `Usuario`, `Pasajero`, `ContactoNotificacion`, `Ruta`, `Parada`, `Viaje`, `NotificacionLog`, `LogPeticion`.

## Seguridad

- No commitear `.env`, `.env.local`, secretos.
- JSON público: `toUsuarioPublico` (sin password/apiKey hash).
- `forgot-password`: sin email; `_dev_token` solo no-production.

## Verificación (sin tests unitarios en repo)

1. `npm run lint`
2. `npm run build`
3. `npm run smoke` (libs siempre; API según `BASE_URL` / Vercel)
4. Manual: login → `/trips` crear/iniciar viaje → `POST .../location` → `/notifications` y dashboard

## Gotchas

1. `validarApiKey`: fallback O(n) keys antiguas con prefijo id.
2. Cada **login** invalida la API Key anterior en cliente (refrescar tras login).
3. Transportistas: sin CRUD HTTP; `register` o DB.
4. Vercel producción puede desplegar **rama `main`**; features en `dev` no aparecen hasta merge/deploy.
5. `POST location` → 403 si transportista ajeno; 429 si &lt;2 s entre posts.
6. Reportes: PDF/Excel UI placeholder; CSV implementado en reports.
7. `estado-proyecto.md` desactualizado; usar plan en `docs/plan-desarrollo-mejoras.md`.

## Alcance fuera del repo

- App Expo transportista
- FCM HTTP v1, Twilio SMS/WhatsApp
- Plan histórico multi-app: `docs/plan-desarrollo-app-transporte.md`

## Documentación para humanos

- `README.md` — onboarding
- `docs/datos-demo-ficticios.md` — seed
- `docs/runbook-mvp.md` — operación
- `docs/plan-desarrollo-mejoras.md` — roadmap + tabla progreso

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->