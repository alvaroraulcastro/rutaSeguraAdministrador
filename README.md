# RutaSegura — Panel de administración y API

Monorepo **Next.js** con **panel web** para operadores/transportistas y **API REST** (`/api/v1`) para el mismo panel y la futura app móvil. El producto gestiona pasajeros, rutas con paradas ordenadas, viajes diarios y **alertas por proximidad GPS** a contactos de cada pasajero.

## Estado del proyecto

| Área | Estado | Notas |
|------|--------|--------|
| Auth + maestros (pasajeros, rutas, paradas) | Operativo | API Key, filtros por rol, CRUD + Leaflet |
| Viajes + GPS (API) | Operativo | `location`, autorización transportista, rate limit ~2 s |
| Notificaciones | MVP+ | `NotificacionLog`, plantillas ES, FCM legacy opcional |
| Panel (dashboard, viajes, reportes) | Operativo | Mapa viajes `EN_CURSO`, crear viaje, export CSV |
| App transportista (Expo) | Pendiente | Repo aparte; misma API |
| Push / SMS reales | Parcial | `FCM_SERVER_KEY`; Twilio y FCM HTTP v1 pendientes |
| Salud y piloto | Operativo | `GET /api/v1/health`, [`docs/runbook-mvp.md`](./docs/runbook-mvp.md) |

**Documentación**

| Documento | Para qué |
|---------|----------|
| [`docs/documentacion_endpoints.md`](./docs/documentacion_endpoints.md) | Contrato HTTP completo |
| [`docs/plan-desarrollo-mejoras.md`](./docs/plan-desarrollo-mejoras.md) | Roadmap y progreso por fases |
| [`docs/datos-demo-ficticios.md`](./docs/datos-demo-ficticios.md) | Credenciales y datos del seed |
| [`docs/runbook-mvp.md`](./docs/runbook-mvp.md) | Incidentes FCM / DB / GPS |
| [`docs/prisma-migrate.md`](./docs/prisma-migrate.md) | Migraciones vs `db push` |
| [`AGENTS.md`](./AGENTS.md) | Guía para asistentes de código |

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router), build **webpack** (`--webpack` por Prisma) |
| UI | [Ant Design 6](https://ant.design/) + [Tailwind CSS 4](https://tailwindcss.com/) |
| Runtime | React 19 |
| Base de datos | PostgreSQL |
| ORM | Prisma 7 (`@prisma/adapter-pg`, `pg`) |
| Validación | Zod 4 |
| Mapas | Leaflet + react-leaflet |
| Auth | **API Key** (hash en DB; clave plana solo tras login/registro) |
| Deploy | Vercel (`vercel-build` con `prisma db push`) |

## Panel — pantallas

| Ruta | Descripción | Rol |
|------|-------------|-----|
| `/` | Dashboard: KPIs, tabla viajes del día, mapa GPS en curso | Todos autenticados |
| `/passengers` | Pasajeros y contactos | Todos (filtrado API) |
| `/routes` | Rutas y paradas | Todos (filtrado API) |
| `/trips` | Viajes: filtro, iniciar/finalizar, **Nuevo viaje** | Todos (filtrado API) |
| `/notifications` | Historial de alertas | Todos (filtrado API) |
| `/reports` | Reportes operativos + **export CSV** | Todos (filtrado API) |
| `/drivers` | Listado transportistas | Solo `ADMIN` |
| `/settings` | Configuración (umbrales/FCM en solo lectura vía API) | Solo `ADMIN` |

Rutas públicas de UI: `/login`, `/register`, `/forgot-password` (`AuthGate` en el resto).

## Requisitos

- **Node.js** 20 LTS (mínimo 18)
- **PostgreSQL** 12+
- **npm** 9+

## Instalación local

```bash
git clone <url-del-repositorio>
cd rutaSeguraAdministrador
npm install
```

### Variables de entorno

1. Copia [`.env.example`](./.env.example) a **`.env.local`** (recomendado) o usa **`.env`** en la raíz — **no commitear** archivos con secretos.
2. `prisma.config.ts`, el seed y `src/lib/prisma.ts` leen **`POSTGRES_URL`** o **`DATABASE_URL`**.

```env
POSTGRES_URL="postgresql://usuario:password@localhost:5432/rutasegura"
```

| Variable | Obligatorio | Descripción |
|----------|-------------|-------------|
| `POSTGRES_URL` / `DATABASE_URL` | Sí (local) | Conexión PostgreSQL |
| `NEXT_PUBLIC_API_URL` | No | Vacío = mismo host que el panel |
| `FCM_SERVER_KEY` | No | Push real (legacy); sin ella solo logs |
| `GPS_UMBRAL_EN_CAMINO_METROS` | No | Default 400 |
| `GPS_UMBRAL_EN_PUERTA_METROS` | No | Default 80 |
| `PRISMA_SEED_DESTRUCTIVE` | No | `false` evita borrar tablas al seed en staging |

Si `npx prisma db seed` falla con **ECONNREFUSED**, revisa que PostgreSQL esté activo y que la URL exista en `.env.local` o `.env`.

### Base de datos y demo

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

En **Vercel**, `npm run vercel-build` ejecuta `prisma db push` antes del build. Rescate manual: [`prisma/sql/sync_schema_operativo.sql`](./prisma/sql/sync_schema_operativo.sql).

El seed carga **datos ficticios** (ver [`docs/datos-demo-ficticios.md`](./docs/datos-demo-ficticios.md)): 3 transportistas, 9 pasajeros, 5 rutas, viajes en varios estados y notificaciones de ejemplo. Por defecto **borra** datos operativos antes de insertar; usa `PRISMA_SEED_DESTRUCTIVE=false` en entornos con datos reales.

| Rol | Email | Contraseña |
|-----|--------|------------|
| Admin | `admin@rutasegura.com` | `admin123` |
| Transportista | `juan.perez@example.com`, `maria.gonzalez@example.com`, `carlos.vega@example.com` | `driver123` |

### Desarrollo y verificación

```bash
npm run dev          # http://localhost:3000
npm run lint
npm run build
npm run smoke        # libs + API (por defecto contra URL en BASE_URL o Vercel)
```

Tras login, la API Key vive en `localStorage` (`rutasegura_admin_user`) y en `AuthContext`.

## Autenticación

1. `POST /api/v1/auth/login` → `{ user, apiKey }` (la key **se regenera** en cada login).
2. Peticiones protegidas: `X-API-Key: <clave>` o `Authorization: Bearer <clave>`.
3. El proxy (`src/proxy.ts`) exige key en `/api/v1/*` salvo rutas públicas; la validación criptográfica es en cada handler.

Roles: **`ADMIN`** | **`TRANSPORTISTA`**. Los transportistas solo ven/alteran pasajeros, rutas y viajes propios (donde la API aplica filtro u ownership).

## API — resumen

Prefijo `/api/v1`. Detalle en [`docs/documentacion_endpoints.md`](./docs/documentacion_endpoints.md).

| Módulo | Rutas destacadas |
|--------|------------------|
| Sistema | `GET /health` (público, sin API Key) · `GET /config/operativa` (umbrales/FCM) |
| Auth | `login`, `register`, `me`, `profile` (PATCH), recuperación de clave |
| Pasajeros / Rutas / Paradas | CRUD + reordenar paradas |
| Viajes | `GET\|POST /viajes` · `GET /viajes/hoy?fecha=` (día Chile) · `.../location` |
| Notificaciones, Dashboard, Reportes | `notificaciones`, `dashboard/resumen`, `reportes/operacion?dias=` |
| Transportistas | `GET /transportistas` (solo lectura) |

### Probar GPS sin app móvil

1. Inicia un viaje (`PUT` con `estado: "EN_CURSO"` o **Iniciar** en `/trips`).
2. Envía coordenadas cercanas al domicilio del pasajero (ruta `IDA`):

```http
POST /api/v1/viajes/{viajeId}/location
X-API-Key: <apiKey>
Content-Type: application/json

{ "lat": -33.4372, "lng": -70.6072 }
```

Respuesta: distancia a la parada, `notificacionesNuevas`, `viajeCompletado`. Respetar ~2 s entre envíos (429 si spam). Solo el transportista de la ruta (o admin) puede enviar ubicación.

## Estructura del repositorio

```
src/
├── app/                    # Páginas + route handlers (api/v1/…)
├── components/             # Layout, forms, PageHeader, mapas dashboard…
├── contexts/               # AuthContext
├── lib/                    # prisma, auth, geo, notificaciones, GPS, FCM, fechas Chile…
├── theme/                  # appTheme.ts (Ant Design)
└── proxy.ts                # Presencia de API Key en /api/v1/*

prisma/
├── schema.prisma
├── seed.ts                 # Orquesta el demo
├── seed-data.ts            # Catálogo ficticio
└── loadSeedEnv.ts          # Carga .env + .env.local en seed

scripts/                    # smoke-lib.mjs, smoke-api.mjs
docs/                       # Endpoints, plan, runbook, datos demo
```

Alias: `@/*` → `src/*`.

## UI

- Tema: `AppProviders` + `appTheme.ts`, locale `es_ES`.
- Patrones: `MainLayout`, `PageHeader`, `StatCard`, `PageLoading`, `EmptyState`.
- Textos en **español**.

## Seguridad

- No subir `.env`, `.env.local` ni claves reales.
- No exponer `password` ni hash de `apiKey` en JSON.
- `forgot-password`: sin proveedor de email; `_dev_token` solo fuera de `production`.

## Contribuir

1. Rama feature → cambios acotados → `npm run lint` y `npm run build` (y `npm run smoke` si tocas API).
2. Tras cambiar `schema.prisma`: `prisma generate` + `db push` local y actualizar `sync_schema_operativo.sql` si aplica.
3. Mantener alineados **README**, **AGENTS** y `documentacion_endpoints.md` en cambios de auth, env o módulos críticos.

## Licencia

MIT — ver `LICENSE` si existe en el repositorio.

---

*RutaSegura — transporte con alertas por proximidad GPS.*