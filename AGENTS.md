# AGENTS.md — RutaSegura Admin (Web + API)

Guía para asistentes de código que trabajan en este repositorio. Contiene el **panel Next.js** y la **API REST** en el mismo proyecto (App Router).

## Stack (versiones orientativas; ver `package.json`)

- **Next.js** 16.x (App Router) — script `build` usa `next build --webpack` (no quitar `--webpack`: Prisma + adapter `pg` no es compatible con el build Turbopack por defecto).
- **React** 19.x
- **UI:** Ant Design 6.x + Tailwind CSS v4
- **DB:** PostgreSQL
- **ORM:** Prisma 7.x con `@prisma/adapter-pg` y `pg`
- **Validación:** Zod 4.x
- **Auth API:** API Key (hash en `Usuario.apiKey`; clave plana solo en cliente tras login/registro)
- **Mapas:** Leaflet (`react-leaflet`) en formularios de pasajeros/rutas

## Quick start (local)

```bash
npm install
```

Crea `.env.local`:

```env
POSTGRES_URL="postgresql://usuario:password@localhost:5432/rutasegura"
NEXT_PUBLIC_API_URL=
FCM_SERVER_KEY=
```

Prisma toma la URL desde `prisma.config.ts` (`POSTGRES_URL` o `DATABASE_URL`).

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

App: `http://localhost:3000` — seed admin: `admin@rutasegura.com` / `admin123`.

## Comandos

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate && next build --webpack` |
| `npm run start` | Producción |
| `npm run lint` | ESLint |
| `npx prisma studio` | GUI DB |

Tras cambios en `schema.prisma`, ejecutar `prisma generate` (o `npm run build`) antes de confiar en TypeScript.

## Autenticación

1. `POST /api/v1/auth/login` → `{ user, apiKey }` (la key se regenera en cada login).
2. Solo el **hash** de la API key se guarda en DB.
3. Headers aceptados en rutas protegidas: `X-API-Key` o `Authorization: Bearer <apiKey>` (usar `getApiKeyFromRequest` en handlers nuevos).
4. Frontend: `localStorage` clave `rutasegura_admin_user` (`src/contexts/AuthContext.tsx`).
5. Rutas UI públicas: `/login`, `/register`, `/forgot-password` — resto vía `src/components/AuthGate.tsx`.
6. Rutas UI solo `ADMIN`: `/drivers`, `/settings`.

Roles: `ADMIN` | `TRANSPORTISTA`. Varios endpoints filtran por `transportistaId` cuando el rol no es admin.

## API — ubicación del código

- Handlers: `src/app/api/v1/**/route.ts`
- Zod: `src/lib/schemas/*`
- Auth: `src/lib/auth.ts` (`validarApiKey`, `toUsuarioPublico`, `getApiKeyFromRequest`)
- Prisma singleton: `src/lib/prisma.ts` (`runtime` Node; adapter `pg`)
- CORS: `src/lib/cors.ts` — llamar `getCorsHeaders` y `OPTIONS` en rutas usadas por móvil
- Logs HTTP: `src/lib/logger.ts` (`registrarLog`) — sobre todo auth; no loguear secretos

### Convenciones de route handlers

```ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // obligatorio si usa Prisma
```

Validar API key al inicio; responder 401 si falta o es inválida. Validar body con Zod; 400 con `error.issues` cuando aplique.

### Módulos REST

| Módulo | Ruta base | Notas |
|--------|-----------|--------|
| Auth | `/api/v1/auth/*` | `profile` es **PATCH**, no PUT |
| Pasajeros | `/api/v1/pasajeros` | `PATCH` en `[id]` para activo, etc. |
| Rutas / paradas | `/api/v1/rutas`, `.../paradas` | `PUT` paradas = reordenar |
| Viajes | `/api/v1/viajes`, `.../[id]/location` | Location solo si `estado === EN_CURSO` |
| Transportistas | `/api/v1/transportistas` | Solo GET; respuesta sin password/apiKey |
| Notificaciones | `/api/v1/notificaciones`, `.../count` | Listados filtran `PUSH` en listado principal |
| Dashboard | `/api/v1/dashboard/resumen` | KPIs panel |
| Reportes | `/api/v1/reportes/operacion` | Query `dias` (1–90) |

Contrato detallado: `docs/documentacion_endpoints.md`.

## Lógica operativa (GPS y notificaciones)

- `POST /api/v1/viajes/:id/location` → `src/lib/procesarUbicacionViaje.ts`
- Distancia: `src/lib/geo.ts` (Haversine)
- Registro y envío: `src/lib/notificaciones.ts` (`registrarYEnviarNotificacion`; idempotencia por viaje + pasajero + tipo + destinatario)
- Modelo `Viaje` incluye `ultimaLat`, `ultimaLng`, `ultimaUbicacionEn`, `paradaActualOrden`
- Sin `FCM_SERVER_KEY`, las notificaciones se persisten en `NotificacionLog` y se loguean (MVP)

Umbrales actuales (~400 m “en camino”, ~80 m “en puerta”) — ajustar en `procesarUbicacionViaje.ts` si cambia el negocio.

## Proxy

- `src/proxy.ts` exige presencia de API Key / Bearer en `/api/v1/*` (excepto rutas auth públicas configuradas allí).
- La **validación real** ocurre en cada handler con `validarApiKey`.
- El proxy **no** añade CORS.

## Frontend — estructura y patrones

```
src/app/              # pages + route handlers
src/components/       # UI compartida (MainLayout, AuthGate, forms…)
src/contexts/         # AuthContext
src/lib/              # servidor y utilidades compartidas
src/theme/appTheme.ts # ConfigProvider theme
```

- Proveedor raíz: `AppProviders` (AntdRegistry + `ConfigProvider` locale `es_ES` + `App`).
- Layout autenticado: `MainLayout` — menú por grupos, navegación con `router.push` (keys = paths).
- Patrón de página: `PageHeader`, `PageLoading`, `StatCard`; llamadas API con `getApiUrl` + header `X-API-Key` desde `useAuth()`.
- Cliente HTTP base: `src/lib/api.ts` — `NEXT_PUBLIC_API_URL` opcional.

### Mapas (Leaflet)

- Client Components; importar `leaflet/dist/leaflet.css`.
- Cargar `react-leaflet` con `dynamic(..., { ssr: false })` donde ya se hace en forms de pasajeros/rutas.

### Textos

- UI y mensajes de error API en **español**.

## Base de datos

- Schema: `prisma/schema.prisma`
- Seed: `prisma/seed.ts` — **destructivo** (`deleteMany` en orden FK) antes de insertar demo.
- `tsconfig` puede excluir `prisma/`; el seed usa `tsx` y su propio cliente.

Entidades principales: `Usuario`, `Pasajero`, `ContactoNotificacion`, `Ruta`, `Parada`, `Viaje`, `NotificacionLog`, `LogPeticion`.

## Seguridad

- No commitear secretos ni `.env.local`.
- No devolver `password` ni hash de `apiKey` en JSON (usar `toUsuarioPublico`).
- `forgot-password`: no hay proveedor de email; `_dev_token` solo fuera de `production`.

## Verificación (sin suite de tests)

1. `npm run lint`
2. `npm run build`
3. Manual: login → CRUD pasajero/ruta → viaje `EN_CURSO` → `POST .../location` → revisar `/notifications`

## Gotchas conocidos

1. `validarApiKey` puede escanear usuarios con prefijo de id en la key (fallback O(n) para keys antiguas).
2. `estado-proyecto.md` en `docs/` puede desactualizarse; prioridad: **código + `docs/documentacion_endpoints.md` + este archivo**.
3. README orientado a humanos; AGENTS orientado a automatización — mantener ambos alineados al cambiar auth, build o módulos críticos.
4. Transportistas: no hay CRUD HTTP completo; alta vía `register` o DB.
5. Reportes/export PDF-Excel en UI: placeholders; datos vía API `reportes/operacion`.

## Alcance fuera de este repo

- App **Expo** transportista (GPS en background, publicación store).
- Integraciones Twilio / FCM HTTP v1 con service account.
- Monorepo Turborepo (plan histórico en `docs/plan-desarrollo-app-transporte.md`).