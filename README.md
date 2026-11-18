# RutaSegura — Panel de administración y API

Monorepo **Next.js** que incluye el **panel web** para operadores/administradores y la **API REST** (`/api/v1`) consumida por el panel y por la futura app móvil del transportista. El objetivo del producto es gestionar pasajeros, rutas y viajes, y disparar **alertas por proximidad GPS** a contactos de cada pasajero.

## Estado del proyecto

| Área | Estado | Notas |
|------|--------|--------|
| API maestros (auth, pasajeros, rutas, paradas) | Operativo | CRUD + validación Zod |
| API viajes + ubicación GPS | Operativo (MVP) | Haversine, logs en `NotificacionLog`; FCM opcional |
| Panel web | Operativo | Pasajeros/rutas con API; dashboard, reportes y viajes con datos reales |
| App transportista (Expo) | Pendiente | Repo aparte; consume la misma API |
| Push / SMS reales | Parcial | `FCM_SERVER_KEY` + Twilio aún no integrados en producción |

Documentación ampliada en [`docs/`](./docs/). Contrato HTTP detallado: [`docs/documentacion_endpoints.md`](./docs/documentacion_endpoints.md).

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router), build con **webpack** (`--webpack` obligatorio por Prisma) |
| UI | [Ant Design 6](https://ant.design/) + [Tailwind CSS 4](https://tailwindcss.com/) |
| Runtime UI | React 19 |
| Base de datos | PostgreSQL |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Validación | Zod 4 |
| Mapas (admin) | Leaflet + react-leaflet |
| Auth API | **API Key** (hash bcrypt en DB; clave plana solo en cliente tras login) |
| Deploy típico | Vercel |

## Funcionalidades del panel

- **Dashboard:** KPIs del día (`/api/v1/dashboard/resumen`).
- **Pasajeros y rutas:** CRUD con mapa (domicilio/destino, contactos de notificación).
- **Viajes:** listado, iniciar/finalizar desde UI de prueba (`/trips`).
- **Transportistas:** listado desde API (solo lectura; rol `ADMIN`).
- **Notificaciones:** historial desde `NotificacionLog`.
- **Reportes:** agregación por período (`/api/v1/reportes/operacion`).
- **Auth:** login, registro, recuperación de contraseña (email no enviado aún; token dev en no-prod).

Rutas solo admin: `/drivers`, `/settings` (ver `AuthGate`).

## Requisitos

- **Node.js** 20 LTS recomendado (mínimo 18).
- **PostgreSQL** 12+.
- **npm** 9+.

## Instalación local

```bash
git clone <url-del-repositorio>
cd rutaSeguraAdministrador
npm install
```

### Variables de entorno

Crea `.env.local` en la raíz (no commitear). Prisma lee la URL desde `prisma.config.ts`:

```env
POSTGRES_URL="postgresql://usuario:password@localhost:5432/rutasegura"
# Alternativa equivalente:
# DATABASE_URL="postgresql://..."

# Opcional: si el front llama a otro host (vacío = rutas relativas /api/...)
NEXT_PUBLIC_API_URL=

# Opcional: envío push real (sin esto se registran logs y se simula en consola)
FCM_SERVER_KEY=
```

### Base de datos

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

En **Vercel**, el script `vercel-build` ejecuta `prisma db push` antes del build para alinear el schema de producción. Si el deploy falla en ese paso, puedes aplicar manualmente `prisma/sql/sync_schema_operativo.sql` en PostgreSQL.

El seed crea datos de ejemplo y **borra tablas relacionadas** antes de insertar. Credenciales de prueba:

| Rol | Email | Contraseña |
|-----|--------|------------|
| Admin | `admin@rutasegura.com` | `admin123` |
| Transportista | `juan.perez@example.com` | `driver123` |

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Tras login, la API Key queda en el contexto de sesión del navegador (`AuthContext`).

### Otros comandos

```bash
npm run build    # prisma generate && next build --webpack
npm run start    # producción
npm run lint
npx prisma studio
```

## Autenticación

1. `POST /api/v1/auth/login` → `{ user, apiKey }`.
2. Peticiones protegidas: header `X-API-Key: <clave>` o `Authorization: Bearer <clave>`.
3. El panel guarda usuario + apiKey en `localStorage` (`rutasegura_admin_user`).

Roles (`Usuario.rol`): `ADMIN` | `TRANSPORTISTA`. Los transportistas ven solo sus pasajeros/rutas/viajes donde aplica el filtro en API.

## API — resumen de rutas

Prefijo: `/api/v1`. Especificación completa en [`docs/documentacion_endpoints.md`](./docs/documentacion_endpoints.md).

| Módulo | Rutas |
|--------|--------|
| Auth | `POST login`, `register`, `forgot-password`, `reset-password`, `change-password` · `GET me` · `PATCH profile` |
| Pasajeros | `GET\|POST /pasajeros` · `GET\|PUT\|DELETE\|PATCH /pasajeros/:id` |
| Rutas | `GET\|POST /rutas` · `GET\|PUT\|DELETE /rutas/:id` · paradas `GET\|POST\|PUT`, `DELETE .../paradas/:paradaId` |
| Viajes | `GET\|POST /viajes` · `GET\|PUT\|DELETE /viajes/:id` · `POST /viajes/:id/location` |
| Transportistas | `GET /transportistas` |
| Notificaciones | `GET /notificaciones` · `GET /notificaciones/count` |
| Panel | `GET /dashboard/resumen` · `GET /reportes/operacion?dias=7` |

### Probar GPS sin app móvil

1. Inicia un viaje (`PUT /viajes/:id` con `estado: "EN_CURSO"` o botón **Iniciar** en `/trips`).
2. Envía ubicación cercana a una parada (domicilio del pasajero en ruta `IDA`):

```http
POST /api/v1/viajes/{viajeId}/location
X-API-Key: <apiKey>
Content-Type: application/json

{ "lat": -33.4372, "lng": -70.6072 }
```

Respuesta incluye distancia a la parada, notificaciones nuevas y posible cierre automático del viaje.

## Estructura del repositorio

```
src/
├── app/                 # Páginas (App Router) + API routes
│   ├── api/v1/          # REST
│   ├── trips/           # Viajes (UI)
│   └── ...
├── components/          # Layout, forms, PageHeader, StatCard, AuthGate...
├── contexts/            # AuthContext
├── lib/                 # prisma, auth, schemas, geo, notificaciones, procesarUbicacionViaje
├── theme/               # Tokens Ant Design (appTheme.ts)
└── proxy.ts             # Guardia mínima en /api/v1/*

prisma/
├── schema.prisma
└── seed.ts

docs/                    # Plan, ER, endpoints, wireframes
```

Alias TypeScript: `@/*` → `src/*`.

## UI y experiencia de uso

- Tema global: `src/theme/appTheme.ts` + `AppProviders` (locale `es_ES`, contenedor `App` de antd).
- Layout principal: `MainLayout` (menú agrupado, responsive, breadcrumbs).
- Componentes compartidos: `PageHeader`, `StatCard`, `PageLoading`, `EmptyState`.
- Textos de interfaz y API en **español**.

## Seguridad

- No subir `.env`, `.env.local` ni API keys reales al repositorio.
- `forgot-password` no envía correo aún; en desarrollo puede incluir `_dev_token` en la respuesta.
- Contraseñas y API keys en logs de petición deben permanecer enmascaradas donde use `registrarLog`.

## Contribuir y soporte

1. Rama feature → cambios acotados → `npm run lint` y `npm run build`.
2. Tras cambiar `prisma/schema.prisma`: `npx prisma generate` y `db push` en tu entorno.
3. Issues: descripción, pasos, entorno (Node, SO, navegador).

## Licencia

MIT — ver `LICENSE` si existe en el repo.

---

*RutaSegura — administración de transporte con alertas por proximidad GPS.*