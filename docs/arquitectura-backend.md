# 🚀 Arquitectura Backend para RutaSegura

## 1. Resumen de la Arquitectura

La arquitectura propuesta se basa en un enfoque de **backend integrado** utilizando las **API Routes de Next.js**, desplegadas como **Serverless Functions en Vercel**. Esta estrategia es ideal para el ecosistema existente (Next.js, Vercel) y proporciona una base escalable, segura y fácil de mantener para ser consumida tanto por el panel de administración web como por la aplicación móvil en Expo.

El backend funcionará como una **API RESTful** que gestiona todas las operaciones de la lógica de negocio (CRUD de entidades, autenticación, etc.).

## 2. Stack Tecnológico del Backend

- **Framework**: Next.js (API Routes)
- **Despliegue**: Vercel (Serverless Functions)
- **Base de Datos**: PostgreSQL (gestionada por Prisma)
- **ORM**: Prisma
- **Autenticación**: API Keys únicas por usuario/cliente.
- **Validación de Datos**: Zod

## 3. Estructura de Directorios

La API residirá dentro del directorio `src/app/api/`. Se recomienda versionar la API para facilitar futuras actualizaciones sin romper la compatibilidad con clientes antiguos.

```
src/
└── app/
    └── api/
        └── v1/
            ├── auth/
            │   ├── login/         # POST para autenticar y obtener token/sesión
            │   │   └── route.ts
            │   └── register/      # POST para crear un nuevo usuario
            │       └── route.ts
            ├── rutas/
            │   ├── [id]/          # GET, PUT, DELETE para una ruta específica
            │   │   └── route.ts
            │   └── route.ts       # GET, POST para la colección de rutas
            ├── pasajeros/
            │   └── ...
            └── transportistas/
                └── ...
```

## 4. Flujo de Autenticación con API Keys

Este sistema es ideal para la comunicación servidor-a-servidor o con clientes de confianza (como tu propia app móvil). Reemplaza la necesidad de un flujo de login tradicional con tokens de corta duración como JWT.

### Modelo de Datos

El modelo `Usuario` en `schema.prisma` se ampliará para incluir una API Key.

```prisma
model Usuario {
  id        String   @id @default(cuid())
  // ... otros campos
  apiKey    String?  @unique // La API Key hasheada
}
```

### Flujo de Verificación

1.  **Generación de API Key**: Cuando un usuario se registra o la solicita, se genera una clave criptográficamente segura (ej: `uuidv4` o `crypto.randomBytes`).
2.  **Almacenamiento Seguro**: La clave **nunca se guarda en texto plano**. Se le aplica un hash (usando `bcrypt` o `crypto`) y es este hash el que se almacena en el campo `apiKey` de la base de datos.
3.  **Petición del Cliente**: La aplicación cliente (web admin o app Expo) incluye la API Key en texto plano en un encabezado HTTP en cada petición a un endpoint protegido.
    ```
    X-API-Key: sk_live_xxxxxxxxxxxxxxxxxxxx
    ```
4.  **Verificación en el Middleware**: Un middleware de Next.js interceptará todas las peticiones a `/api/v1/*` (excepto las rutas públicas como `/login` o `/register`).
    - Extrae la API Key del encabezado `X-API-Key`.
    - *Hashea* la clave recibida usando el mismo algoritmo.
    - Busca en la base de datos un usuario cuyo `apiKey` (hasheado) coincida con el hash recién calculado.
    - Si se encuentra un usuario, la petición se considera autorizada y se puede adjuntar la información del usuario al objeto de la petición para su uso en los endpoints.
    - Si no se encuentra, se devuelve un error `401 Unauthorized`.

## 5. Validación de Datos con Zod

Para garantizar la robustez y prevenir errores, todas las entradas (payloads de `POST`/`PUT`) y salidas (respuestas `GET`) de la API deben ser validadas.

- **Definición de Esquemas**: Se crearán esquemas de Zod que definan la forma de los datos. Estos esquemas pueden ser compartidos entre el frontend y el backend.

  ```typescript
  // src/lib/schemas/ruta.ts
  import { z } from 'zod';

  export const crearRutaSchema = z.object({
    nombre: z.string().min(3, 'El nombre es demasiado corto'),
    transportistaId: z.string().cuid(),
    // ... otros campos
  });
  ```

- **Uso en API Routes**: El endpoint valida el cuerpo de la petición antes de procesarla.

  ```typescript
  // src/app/api/v1/rutas/route.ts
  import { crearRutaSchema } from '@/lib/schemas/ruta';

  export async function POST(request: Request) {
    const json = await request.json();
    const validation = crearRutaSchema.safeParse(json);

    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error.format() }), {
        status: 400,
      });
    }

    // ... lógica para crear la ruta
  }
  ```

## 6. Integración con Vercel y GitHub (CI/CD)

- **Repositorio**: El código fuente completo (frontend y backend) reside en un único repositorio de GitHub.
- **Proyecto Vercel**: Se crea un proyecto en Vercel y se vincula a este repositorio.
- **Despliegue Automático**: Vercel está configurado por defecto para detectar proyectos Next.js. Cada vez que se realice un `git push` a la rama principal (ej. `main`), Vercel automáticamente:
    1.  Instalará las dependencias (`npm install`).
    2.  Ejecutará el build del proyecto (`next build`).
    3.  Desplegará los componentes de React como assets estáticos y las API Routes como Serverless Functions.
    4.  Asignará la URL de producción al nuevo despliegue.
- **Variables de Entorno**: La `DATABASE_URL` y otras claves secretas se configuran de forma segura en el panel de control de Vercel, nunca en el código fuente.
