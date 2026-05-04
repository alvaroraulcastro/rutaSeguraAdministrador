# AGENTS.md — RutaSegura Admin

High-signal context for OpenCode sessions working on this repository.

## Stack & Runtime

- **Next.js 16+** App Router, **React 19**, TypeScript strict.
- **UI:** Ant Design 6 + Tailwind CSS 4 (via `@tailwindcss/postcss`).
- **ORM:** Prisma 7.5 with `@prisma/adapter-pg` (PostgreSQL via `pg` Pool).
- **Validation:** Zod. **Auth:** Custom API-key scheme (bcrypt-hashed in DB, plain key returned to client).
- **No test framework** is currently installed.

## Essential Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Install deps |
| `npm run dev` | Start dev server on `localhost:3000` |
| `npm run build` | `prisma generate && next build --webpack` |
| `npx next build --webpack` | Build for production using webpack (required because Prisma is incompatible with Turbopack build). |
| `npm run lint` | `eslint` (ESLint 9, `eslint-config-next` core-web-vitals + TS) |
| `npx prisma generate` | Regenerate Prisma client (done automatically by `build`) |
| `npx prisma migrate dev` | Run migrations against `POSTGRES_URL`/`DATABASE_URL` |
| `npx prisma db seed` | Run `prisma/seed.ts` (also configured in `prisma.config.ts`) |

> **Order matters:** After schema changes, run `prisma generate` (or `migrate dev`) before `npm run dev`/`build`, or the app will fail with missing/generated client types.

## Prisma & Database

- **Config file:** `prisma.config.ts` (Prisma 7 format). It imports `dotenv/config` and reads `POSTGRES_URL` or `DATABASE_URL`.
- **Schema:** `prisma/schema.prisma`. Models: `Usuario`, `Pasajero`, `Ruta`, `Parada`, `Viaje`, `NotificacionLog`, `ContactoNotificacion`, `LogPeticion`.
- **Seed:** `prisma/seed.ts` creates an admin (`admin@rutasegura.com` / `admin123`) and sample transportistas/passengers/routes.
- **Client singleton:** `src/lib/prisma.ts` uses a Proxy + global singleton so the `pg` adapter is not recreated on every HMR reload.
- **Important:** `tsconfig.json` explicitly **excludes `prisma/`**. The seed uses its own `PrismaClient` instance directly.

## Auth & API Conventions

- **Middleware:** `src/middleware.ts` guards `/api/v1/*`. It only checks that `X-API-Key` or `Authorization: Bearer <key>` **exists**; real validation happens inside API routes.
- **API routes** generally export:
  - `export const dynamic = 'force-dynamic'`
  - `export const runtime = 'nodejs'`
  - An `OPTIONS` handler that returns `getCorsHeaders(request)`
- **Auth helpers:** `src/lib/auth.ts`
  - `getApiKeyFromRequest(request)` — reads header.
  - `validarApiKey(apiKey)` — bcrypt-compares against all `Usuario.apiKey` hashes (linear scan; acceptable for current scale).
  - `toUsuarioPublico(usuario)` — strips `password` and `apiKey` before JSON response.
- **Client auth:** `AuthContext` stores the full `User` object (including plain `apiKey`) in `localStorage` under `rutasegura_admin_user`. All authenticated fetch calls send `X-API-Key: user.apiKey`.

## Project Structure

```
src/app/          # Next.js App Router pages + API routes
src/app/api/v1/   # REST API entrypoints (auth, transportistas, pasajeros, rutas, viajes)
src/components/   # React components (Ant Design based)
src/contexts/     # AuthContext (client-side auth state)
src/lib/          # prisma.ts, auth.ts, api.ts, cors.ts, logger.ts, schemas/
src/data/         # Mock data files (e.g. mockPassengersWithAddresses.ts)
prisma/           # schema.prisma, seed.ts
public/           # Static assets
docs/             # Markdown docs (plan, wireframes)
```

- Path alias: `@/*` → `./src/*`.
- UI text and API messages are in **Spanish**.

## Environment Variables

Required in `.env` (the repo currently has a committed `.env`):

- `DATABASE_URL` or `POSTGRES_URL` — PostgreSQL connection string.
- `PRISMA_DATABASE_URL` — Also set in current env.
- `API_RUTA_SEGURA_URL_BASE` / `NEXT_PUBLIC_API_URL` — Used by `src/lib/api.ts` for client-side fetch base URL.

## Style & Lint

- ESLint 9 flat config (`eslint.config.mjs`) extends `eslint-config-next/core-web-vitals` + `typescript`.
- Tailwind CSS 4 is used via PostCSS plugin (`@tailwindcss/postcss`).
- `globals.css` is imported in `src/app/layout.tsx`.

## Notes & Gotchas

1. **No tests.** Any verification is manual (`npm run lint` + `npm run build` + runtime check).
2. **API key validation is O(n)** over all users with non-null `apiKey`. Do not optimize prematurely, but be aware if scaling.
3. **Prisma client regeneration** is required after any `schema.prisma` change before TypeScript will compile.
4. **CORS** is handled manually in every API route via `getCorsHeaders`; the middleware does not add CORS.
5. **Logging** of all requests goes to `LogPeticion` via `registrarLog()` in API routes; passwords are masked before storage.
6. **Edge runtime limitation:** Prisma with `@prisma/adapter-pg` cannot run in Edge runtime; all API routes that touch the DB explicitly set `runtime = 'nodejs'`.
7. **Seed script** deletes all existing data before inserting defaults (`deleteMany` cascade order matters).
8. **Turbopack build limitation:** `next build` uses Turbopack by default in Next.js 16, but Prisma client fails with `Failed to load external module @prisma/client-<hash>`. The workaround is to force webpack via `--webpack` flag in the build script. **Never remove `--webpack` from `package.json` `build` script or builds will break.**
