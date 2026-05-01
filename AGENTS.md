# AGENTS.md — RutaSegura Admin (Web + API)

Este repo contiene el **Panel Web Admin** y la **API HTTP** (REST) del sistema RutaSegura en un solo proyecto **Next.js App Router**.

## Stack

- **Next.js:** 16.x (App Router)
- **React:** 19.x
- **UI:** Ant Design (antd) 6.x + Tailwind CSS v4
- **DB:** PostgreSQL
- **ORM:** Prisma 7.x (`@prisma/adapter-pg`)
- **Mapas:** Leaflet (`react-leaflet`)

## Quick Start (Local)

### 1) Instalar dependencias

```bash
npm install
```

### 2) Variables de entorno

Este repo **no incluye** un `.env.example`. Crea `.env.local` manualmente en la raíz del proyecto.

Variables usadas por el proyecto:

- `DATABASE_URL` o `POSTGRES_URL` (requerida): string de conexión a PostgreSQL
- `NEXT_PUBLIC_API_URL` (opcional): base URL para que el frontend apunte a una API externa. Si no existe, usa rutas relativas (`/api/...`) al mismo Next.js.

Ejemplo:

```env
POSTGRES_URL="postgresql://usuario:password@localhost:5432/rutasegura"
# o
DATABASE_URL="postgresql://usuario:password@localhost:5432/rutasegura"

# opcional (solo si el frontend debe llamar una API externa)
NEXT_PUBLIC_API_URL=""
```

### 3) Prisma (generar, sincronizar, seed)

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

Notas:
- El schema está en `prisma/schema.prisma`.
- Este proyecto usa `db push` (sin migraciones) como flujo principal de sincronización local.

### 4) Levantar el entorno

```bash
npm run dev
```

App: `http://localhost:3000`

## Comandos útiles

| Comando | Uso |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build (incluye `prisma generate`) |
| `npm run start` | Ejecutar build |
| `npm run lint` | ESLint |
| `npx prisma studio` | GUI de Prisma |

## Autenticación (API Key)

La autenticación del sistema es por **API Key** (no JWT). Flujo:

1. `POST /api/v1/auth/login` valida credenciales y devuelve `{ user, apiKey }`.
2. El backend guarda **solo el hash** de la API key en la DB (`Usuario.apiKey`).
3. El cliente debe enviar en cada request protegida:
   - `X-API-Key: <apiKey>` (preferido), o
   - `Authorization: Bearer <apiKey>` (soportado en varios endpoints).

Frontend:
- El usuario se persiste en `localStorage` bajo la clave `rutasegura_admin_user` (ver `src/contexts/AuthContext.tsx`).
- Las rutas se protegen con `src/components/AuthGate.tsx`.

## API (Ubicación del código)

- Endpoints: `src/app/api/v1/**/route.ts`
- Validación: `src/lib/schemas/*` (Zod)
- Auth helpers: `src/lib/auth.ts` (`getApiKeyFromRequest`, `validarApiKey`)
- Prisma client: `src/lib/prisma.ts`
- CORS: `src/lib/cors.ts`

## Módulos principales

- Auth: `/api/v1/auth/*`
- Pasajeros: `/api/v1/pasajeros`
- Rutas + Paradas: `/api/v1/rutas` y `/api/v1/rutas/:id/paradas`
- Viajes: `/api/v1/viajes` y `/api/v1/viajes/:id/location`
- Transportistas: `/api/v1/transportistas`

## Mapas (Leaflet)

El repo usa `leaflet` + `react-leaflet`. Recordatorios:

- Los componentes con mapa deben ser **Client Components** y evitar SSR (ej: `dynamic(..., { ssr: false })`).
- Se requiere `leaflet/dist/leaflet.css` (puede importarse en un client component o en `globals.css`).

## Estructura (alta nivel)

- `src/app/` — páginas y API routes
- `src/components/` — componentes UI (pasajeros, rutas, layout, auth gate)
- `src/contexts/` — estado global (Auth)
- `src/lib/` — utilidades (API URL, Prisma, auth, CORS, schemas)
- `prisma/` — schema + seed
- `docs/` — documentación adicional (incluye documentación de endpoints)

## Seguridad / secretos

- No subir llaves/tokens al repo. GitHub puede bloquear pushes por secret scanning.
- Evitar commitear archivos que contengan API keys (ej: claves de Vercel, etc.).

## Notas del repo

- `README.md` puede contener secciones desactualizadas (por ejemplo, menciones a JWT/NextAuth). La fuente de verdad es el código en `src/`.
