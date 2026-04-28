# 🚐 RutaSegura — Panel de Administración Web

Este repositorio contiene la aplicación **Web Admin** del sistema **RutaSegura**, una plataforma integral para la gestión de transporte particular de personas con notificaciones automáticas basadas en GPS.

## � Estado del Proyecto

**✅ Fase 1 Completada** - Sistema base implementado
**🚧 Fase 2 en Desarrollo** - GPS y notificaciones

### 📈 Progreso Actual
- **Backend API:** 100% completado (20+ endpoints)
- **Panel Web Admin:** 90% completado
- **App Android:** 0% (próxima fase)
- **Sistema de Notificaciones:** 30% completado

## 🚀 Stack Tecnológico

### Frontend & Backend
- **Framework:** [Next.js 14+](https://nextjs.org/) con App Router
- **UI Framework:** [Ant Design (antd)](https://ant.design/) + [Tailwind CSS](https://tailwindcss.com/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Base de datos:** PostgreSQL con [Prisma ORM](https://www.prisma.io/)
- **Autenticación:** JWT con sistema propio
- **Despliegue:** [Vercel](https://vercel.com/)

### Próximas Integraciones
- **App Mobile:** React Native con Expo
- **Notificaciones:** Firebase Cloud Messaging (FCM)
- **GPS:** Expo Location API
- **Mapas:** Google Maps API
- **SMS/WhatsApp:** Twilio API

## 🎯 Funcionalidades Implementadas

### 🔐 Sistema de Autenticación
- Login/Logout con JWT
- Registro de usuarios administradores
- Recuperación y cambio de contraseña
- Perfiles de usuario

### 👥 Gestión de Transportistas
- CRUD completo de conductores
- Registro de vehículos (patente, modelo, capacidad)
- Asignación de API Keys únicas
- Perfiles con información de contacto

### 🧍 Gestión de Pasajeros
- Registro completo con domicilio y destino
- Coordenadas GPS de ubicaciones
- Contactos de notificación configurables
- Gestión de información de contacto

### 🛣️ Gestión de Rutas
- Creación de rutas con orden de paradas
- Tipos de ruta: Ida, Vuelta, Ida y Vuelta
- Asignación de pasajeros a rutas
- Gestión de días activos (Lunes a Domingo)

### 📊 Panel de Control
- Dashboard con métricas y estadísticas
- Vista de rutas activas
- Interfaz responsive con Ant Design
- Navegación intuitiva

## 🚧 Funcionalidades en Desarrollo

### 📍 Tracking GPS en Tiempo Real
- Recepción de ubicaciones desde app mobile
- Cálculo de distancia a próxima parada
- Geofencing para notificaciones automáticas

### 🔔 Sistema de Notificaciones
- Notificaciones Push con FCM
- Integración con Twilio para SMS/WhatsApp
- Logs de notificaciones enviadas
- Configuración por contacto

### 📱 App Android para Transportistas
- Login mobile
- Vista de rutas del día
- Tracking GPS automático
- Controles de inicio/fin de viaje

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

### Configuración Local

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd ruta-segura-admin
   ```

2. **Instala dependencias:**
   ```bash
   npm install
   ```

3. **Configura variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/rutasegura"
   JWT_SECRET="tu-jwt-secret-key-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Configura la base de datos:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Ejecuta el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

6. **Abre la aplicación:**
   http://localhost:3000

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción

# Base de datos
npx prisma generate  # Genera cliente Prisma
npx prisma db push   # Sincroniza schema con DB
npx prisma studio    # Abre Prisma Studio

# Linting
npm run lint         # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Endpoints API (REST)
│   │   └── v1/
│   │       ├── auth/      # Autenticación
│   │       ├── pasajeros/ # Gestión de pasajeros
│   │       ├── rutas/     # Gestión de rutas
│   │       └── transportistas/ # Gestión de conductores
│   └── [pages]/           # Páginas de la aplicación
├── components/            # Componentes reutilizables
│   ├── passengers/        # Componentes de pasajeros
│   ├── routes/           # Componentes de rutas
│   └── AuthGate.tsx     # Protección de rutas
├── contexts/             # Contextos de React
│   └── AuthContext.tsx  # Contexto de autenticación
├── data/                 # Datos mock y utilities
└── lib/                  # Librerías y configuraciones
    ├── schemas/          # Esquemas Zod para validación
    ├── api.ts           # Cliente HTTP
    ├── auth.ts          # Utilidades de autenticación
    ├── cors.ts          # Configuración CORS
    ├── logger.ts        # Sistema de logging
    └── prisma.ts        # Instancia de Prisma Client

prisma/
├── schema.prisma        # Schema de la base de datos
└── seed.ts              # Datos de prueba

docs/                    # Documentación del proyecto
├── plan-desarrollo-app-transporte.md
├── estado-proyecto.md
├── arquitectura-backend.md
├── diagrama-er.md
└── wireframes-web-admin.md
```

## 🌐 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/forgot-password` - Recuperar contraseña
- `POST /api/v1/auth/reset-password` - Restablecer contraseña
- `GET /api/v1/auth/me` - Obtener perfil actual
- `PUT /api/v1/auth/profile` - Actualizar perfil
- `PUT /api/v1/auth/change-password` - Cambiar contraseña

### Gestión de Datos
- `GET|POST /api/v1/pasajeros` - Listar/Crear pasajeros
- `GET|PUT|DELETE /api/v1/pasajeros/[id]` - Gestionar pasajero
- `GET|POST /api/v1/rutas` - Listar/Crear rutas
- `GET|PUT|DELETE /api/v1/rutas/[id]` - Gestionar ruta
- `GET|POST /api/v1/rutas/[id]/paradas` - Gestionar paradas
- `GET /api/v1/transportistas` - Listar transportistas

## 📄 Documentación Adicional

- [📋 Plan de Desarrollo Completo](./docs/plan-desarrollo-app-transporte.md)
- [📊 Estado Actual del Proyecto](./docs/estado-proyecto.md)
- [🏗️ Arquitectura del Backend](./docs/arquitectura-backend.md)
- [🔗 Diagrama Entidad-Relación](./docs/diagrama-er.md)
- [🎨 Wireframes del Panel Web](./docs/wireframes-web-admin.md)
- [📝 Documentación de Endpoints](./docs/documentacion_endpoints.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🐛 Reportar Issues

Si encuentras algún bug o tienes sugerencias, por favor abre un issue en el repositorio con:
- Descripción detallada del problema
- Pasos para reproducir
- Capturas de pantalla (si aplica)
- Entorno (navegador, SO, versión de Node)

---

**Desarrollado con ❤️ en 2026**  
*Sistema de gestión de transporte particular con notificaciones inteligentes*
