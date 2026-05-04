# AGENTS.md — RutaSegura Admin (Web + API)

Este repo contiene el **Panel Web Admin** y la **API HTTP** (REST) del sistema RutaSegura en un solo proyecto **Next.js App Router**.

## Stack

- **Next.js:** 16.x (App Router)
- **React:** 19.x
- **UI:** Ant Design (antd) 6.x + Tailwind CSS v4
- **DB:** PostgreSQL
- **ORM:** Prisma 7.x (`@prisma/adapter-pg`)
- **Validación:** Zod
- **Auth:** API Key (hash en DB, clave plana solo en el cliente tras login)
- **Mapas:** Leaflet (`react-leaflet`) donde aplique

## Quick Start (Local)

### 1) Instalar dependencias

```bash
npm install
```

### 2) Variables de entorno

Crea `.env.local` en la raíz (no commitear secretos).

- `DATABASE_URL` o `POSTGRES_URL` (requerida): conexión PostgreSQL
- `NEXT_PUBLIC_API_URL` (opcional): base URL si el front debe llamar otra API. Vacío o ausente → rutas relativas (`/api/...`) al mismo Next.js (recomendado en dev local)

Ejemplo:

```env
POSTGRES_URL="postgresql://usuario:password@localhost:5432/rutasegura"
NEXT_PUBLIC_API_URL=
```

### 3) Prisma

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

- Schema: `prisma/schema.prisma`
- `tsconfig.json` **excluye `prisma/`**; el seed usa su propio `PrismaClient`.

### 4) Desarrollo

```bash
npm run dev
```

App: `http://localhost:3000`

## Comandos útiles

| Comando | Uso |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate && next build --webpack` |
| `npm run start` | Servir build de producción |
| `npm run lint` | ESLint |
| `npx prisma studio` | GUI Prisma |

> **Build:** Prisma con el adapter `pg` falla con el build por defecto de Next 16 (Turbopack). El script `build` usa **`next build --webpack`**. No quites `--webpack` de `package.json` o el build se romperá.

> Tras cambios en `schema.prisma`, ejecuta `prisma generate` (o `npm run build`) antes de `dev` o TypeScript fallará.

## Autenticación (API Key)

1. `POST /api/v1/auth/login` devuelve `{ user, apiKey }`.
2. En DB solo se guarda el **hash** de la API key (`Usuario.apiKey`).
3. Requests protegidas: `X-API-Key` o `Authorization: Bearer <apiKey>`.

Frontend: `localStorage` → `rutasegura_admin_user` (`src/contexts/AuthContext.tsx`). Rutas UI: `src/components/AuthGate.tsx`.

## API (código)

- Endpoints: `src/app/api/v1/**/route.ts`
- Schemas Zod: `src/lib/schemas/*`
- Auth: `src/lib/auth.ts` (`getApiKeyFromRequest`, `validarApiKey`)
- Prisma: `src/lib/prisma.ts` (singleton + adapter `pg`)
- CORS: `src/lib/cors.ts`
- Logs: `LogPeticion` vía `registrarLog()` donde aplique; contraseñas enmascaradas

### Convenciones de rutas API

- `export const dynamic = 'force-dynamic'`
- `export const runtime = 'nodejs'` en **todas** las rutas que usen Prisma (el adapter `pg` no corre en Edge)

## Proxy (antes middleware)

- `src/proxy.ts` comprueba que exista API Key / Bearer en `/api/v1/*`; la validación real es en cada route handler.
- Next.js 16 puede avisar que la convención `middleware` está deprecada a favor de `proxy` (este repo ya usa `proxy.ts`).

## Módulos principales

- Auth: `/api/v1/auth/*`
- Pasajeros: `/api/v1/pasajeros`
- Rutas + paradas: `/api/v1/rutas`, `/api/v1/rutas/:id/paradas`
- Viajes: `/api/v1/viajes`, ubicación, etc.
- Transportistas: `/api/v1/transportistas`
- Notificaciones: según rutas bajo `api/v1`

## Mapas (Leaflet)

- Componentes con mapa: Client Components; evitar SSR (`dynamic(..., { ssr: false })` si hace falta).
- Importar `leaflet/dist/leaflet.css` donde corresponda.

## Estructura (alta nivel)

```
src/app/          # páginas + API routes
src/components/   # UI (pasajeros, rutas, layout, AuthGate)
src/contexts/     # Auth
src/lib/          # prisma, auth, api, cors, schemas, logger
src/proxy.ts      # guardia mínima API /api/v1
prisma/           # schema + seed
docs/             # documentación (endpoints, estado proyecto)
```

- Alias: `@/*` → `./src/*`
- Textos UI y mensajes API en **español**

## Seguridad

- No subir llaves ni `.env` con secretos reales.
- `README.md` puede estar desactualizado; la fuente de verdad es el código en `src/`.

## Notas y gotchas

1. No hay suite de tests; verificación manual: `lint` + `build` + prueba en runtime.
2. `validarApiKey` compara contra todos los usuarios con `apiKey` no nula (O(n)); aceptable a escala actual.
3. CORS se define por ruta con `getCorsHeaders`; el proxy no añade CORS.
4. El seed borra datos previos antes de insertar (`deleteMany` en orden correcto).
