# 🚐 Plan de Trabajo — Aplicación de Transporte Particular de Personas

## Opciones de Nombre

| # | Nombre | Concepto |
|---|--------|----------|
| 1 | **RutaYa** | Ruta + inmediatez ("ya"), fácil de recordar |
| 2 | **VanGo** | Juego de palabras: "van" (furgón) + "go" (ir) |
| 3 | **Pasajeros.app** | Directo, descriptivo, enfocado en el pasajero |
| 4 | **TransferiGo** | Transferir + Go, enfoque en traslado |
| 5 | **RutaSegura** | Énfasis en confianza y seguridad |
| 6 | **Llevaré** | En español, cercano, "te llevo" |
| 7 | **PickApp** | "Pick up" en formato app, anglosajón y moderno |
| 8 | **SubeYa** | Coloquial chileno, dinámico, memorable |

> **Recomendación:** `RutaYa` o `SubeYa` funcionan muy bien para el mercado chileno — cercanos, cortos y memorables.

---

## Descripción General del Proyecto

Plataforma de gestión de transporte particular de personas, compuesta por:

- **Web Admin (Next.js + Vercel):** Panel de administración principal para gestionar transportistas, pasajeros, rutas y notificaciones.
- **App Android (Transportista):** Aplicación móvil para que el conductor gestione su ruta en tiempo real, con tracking GPS y envío de notificaciones automáticas.

---

## Stack Tecnológico

### Web (Admin)
- **Framework:** Next.js 14+ (App Router)
- **Deploy:** Vercel
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js o Clerk
- **Base de datos:** PostgreSQL (Supabase o PlanetScale)
- **ORM:** Prisma
- **Notificaciones:** Firebase Cloud Messaging (FCM) o Twilio (SMS/WhatsApp)
- **Mapas:** Google Maps API o Mapbox

### App Android (Transportista)
- **Framework:** React Native (Expo) — permite reutilizar lógica con Next.js
- **GPS/Geolocalización:** Expo Location
- **Notificaciones push:** Expo Notifications + FCM
- **Comunicación con API:** REST o tRPC
- **Mapas:** react-native-maps + Google Maps SDK

### Backend / API
- **API Routes:** Next.js API Routes (o servidor Express separado si escala)
- **WebSockets / Tiempo real:** Pusher, Ably, o Supabase Realtime
- **Geofencing / Cálculo de distancia:** Google Maps Distance Matrix API o cálculo Haversine propio

---

## Módulos del Sistema

### 1. Módulo de Transportistas
- Registro y perfil del transportista
- Gestión de vehículo (patente, capacidad, modelo)
- Asignación de rutas y pasajeros
- Historial de viajes realizados

### 2. Módulo de Pasajeros
- Registro de pasajero (nombre, contacto, foto)
- Registro de domicilio (casa o departamento, con número de depto)
- Registro de destino (trabajo, colegio, otro — con nombre y dirección)
- Contactos de notificación (1 o más personas que reciben alertas: familiar, tutor, etc.)
- Configuración ida / vuelta / ambas

### 3. Módulo de Rutas
- Creación de rutas con orden de paradas (domicilios)
- Configuración de tipo de viaje: ida, vuelta o ida y vuelta
- Horarios estimados por parada
- Gestión de días activos (lunes a viernes, etc.)

### 4. Módulo de Notificaciones
- Alerta "El transporte está a ~1 minuto de tu domicilio"
- Alerta "El transporte ha llegado a tu domicilio"
- Alerta "Has llegado al destino" (colegio, trabajo, etc.)
- Notificaciones de vuelta (mismas alertas en orden inverso)
- Canal: push (app), SMS o WhatsApp (Twilio)
- Destinatarios configurables por pasajero

### 5. Módulo de Tracking (App Android)
- GPS en tiempo real del transportista
- Cálculo de distancia/tiempo a cada próxima parada
- Trigger automático de notificaciones por geofence
- Inicio y fin de ruta manual por el conductor
- Vista del mapa con la ruta del día

### 6. Panel de Administración Web
- Dashboard con estado de rutas activas
- CRUD de transportistas, pasajeros y rutas
- Log de notificaciones enviadas
- Reportes básicos (viajes realizados, pasajeros por ruta)
- Gestión de usuarios administradores

---

## Plan de Trabajo por Fases

### 🔵 Fase 0 — Diseño y Arquitectura (Semana 1–2)

- [ ] Definir nombre y dominio de la aplicación
- [ ] Diseñar modelo de datos (entidades y relaciones)
- [ ] Wireframes del panel web (admin)
- [ ] Wireframes de la app Android (transportista)
- [ ] Definir flujos de usuario (pasajero, transportista, admin)
- [ ] Configurar repositorio (monorepo recomendado: Turborepo)
- [ ] Configurar entornos: desarrollo, staging, producción
- [ ] Configurar Vercel, Supabase/PlanetScale, Firebase

---

### 🟢 Fase 1 — Base del Sistema (Semana 3–5)

**Web (Next.js)**
- [ ] Inicializar proyecto Next.js con Tailwind + shadcn/ui
- [ ] Configurar Prisma + base de datos PostgreSQL
- [ ] Sistema de autenticación (login admin)
- [ ] Layout del panel de administración
- [ ] CRUD de Transportistas
- [ ] CRUD de Pasajeros (con domicilio y destino)
- [ ] CRUD de Rutas y asignación de pasajeros

**App Android (Expo)**
- [ ] Inicializar proyecto Expo con React Native
- [ ] Pantalla de login del transportista
- [ ] Vista de ruta del día (lista de pasajeros por orden)

---

### 🟡 Fase 2 — GPS y Notificaciones (Semana 6–9)

**App Android**
- [ ] Integrar Expo Location para tracking GPS en tiempo real
- [ ] Enviar posición del transportista al backend (intervalo configurable, ej. cada 5 seg)
- [ ] Calcular distancia/tiempo a la próxima parada (API de Google Maps o Haversine)
- [ ] Lógica de trigger: notificar cuando falte ~1 minuto para llegar a un domicilio
- [ ] Lógica de trigger: notificar al llegar al destino (geofence)
- [ ] Integrar Expo Notifications (push)
- [ ] Controles de inicio y fin de viaje

**Web / Backend**
- [ ] Endpoint para recibir posición GPS del transportista
- [ ] Servicio de cálculo de proximidad (geofencing)
- [ ] Servicio de notificaciones (FCM push + SMS/WhatsApp vía Twilio)
- [ ] Log de notificaciones en la base de datos
- [ ] Configuración de contactos de notificación por pasajero

---

### 🟠 Fase 3 — Flujo Ida y Vuelta (Semana 10–11)

- [ ] Configuración de viaje de vuelta por ruta
- [ ] Reversión del orden de paradas para el regreso
- [ ] Notificaciones de vuelta (recogida en destino → entrega en domicilio)
- [ ] UI en app Android para cambiar entre modo "ida" y modo "vuelta"
- [ ] Pruebas de flujo completo ida y vuelta

---

### 🔴 Fase 4 — Panel y Reportes (Semana 12–13)

- [ ] Dashboard web con estado de rutas activas en tiempo real
- [ ] Vista de mapa en el panel web (posición del transportista)
- [ ] Log de notificaciones enviadas (por pasajero, por ruta, por fecha)
- [ ] Reportes básicos: viajes realizados, puntualidad, incidencias
- [ ] Exportación de reportes a PDF o Excel

---

### ⚪ Fase 5 — QA, Ajustes y Deploy (Semana 14–15)

- [ ] Pruebas de integración del flujo completo
- [ ] Pruebas de campo con GPS real (simular rutas)
- [ ] Optimización de batería en la app (intervalo GPS adaptativo)
- [ ] Ajustes de UX en app y panel web
- [ ] Configurar dominio personalizado en Vercel
- [ ] Deploy a producción (Vercel + Supabase prod)
- [ ] Publicación de app en Google Play (internal testing)
- [ ] Documentación básica de uso para administrador y transportista

---

## Modelo de Datos (Entidades Principales)

```
Transportista
  - id, nombre, email, telefono, foto
  - vehiculo: patente, modelo, capacidad

Pasajero
  - id, nombre, telefono, foto
  - domicilio: direccion, numero_depto, lat, lng, instrucciones
  - destino: nombre, direccion, lat, lng

ContactoNotificacion (pertenece a Pasajero)
  - nombre, telefono, email, canal (push/sms/whatsapp)

Ruta
  - id, transportista_id, nombre
  - tipo: ida | vuelta | ida_y_vuelta
  - dias_activos: [lun, mar, ...]
  - paradas: [{ pasajero_id, orden, hora_estimada }]

Viaje (instancia de una Ruta en un día)
  - id, ruta_id, fecha, estado: en_curso | completado
  - posicion_actual: lat, lng, timestamp

Notificacion
  - id, viaje_id, pasajero_id, tipo, canal, estado, timestamp
```

---

## Consideraciones Técnicas Importantes

### Precisión GPS y Batería
- Usar intervalo de 5–10 segundos en movimiento, reducir a 30 seg al detenerse
- Implementar modo background location en Android (requiere permiso especial)
- Calcular tiempo estimado con Google Maps Distance Matrix API para mayor precisión

### Notificaciones
- **Push (FCM):** gratuito, requiere app instalada en el teléfono del contacto
- **SMS/WhatsApp (Twilio):** de pago, pero no requiere app — recomendado para contactos que no tienen smartphone
- Se recomienda ofrecer ambas opciones configurables por contacto

### Privacidad y Seguridad
- El tracking GPS solo está activo cuando el transportista inicia el viaje
- Los contactos de notificación solo reciben alertas, no ven la ubicación en tiempo real
- Autenticación con JWT y refresh tokens
- HTTPS en todos los endpoints

### Escalabilidad
- La arquitectura basada en Next.js API Routes + Supabase es suficiente para comenzar
- Si la base de usuarios crece, se puede migrar el backend a un servidor dedicado (Node.js/Express)
- Supabase Realtime puede reemplazar Pusher para actualizaciones en tiempo real sin costo adicional

---

## Estimación de Tiempos

| Fase | Duración | Hito |
|------|----------|------|
| Fase 0 — Diseño y arquitectura | 2 semanas | Wireframes + modelo de datos listo |
| Fase 1 — Base del sistema | 3 semanas | CRUD funcional en web y app |
| Fase 2 — GPS y notificaciones | 4 semanas | Notificaciones automáticas operativas |
| Fase 3 — Ida y vuelta | 2 semanas | Flujo completo de ruta |
| Fase 4 — Panel y reportes | 2 semanas | Dashboard y reportes listos |
| Fase 5 — QA y deploy | 2 semanas | App en producción |
| **Total estimado** | **~15 semanas** | |

---

## Herramientas y Servicios Recomendados

| Servicio | Propósito | Plan gratuito |
|----------|-----------|---------------|
| Vercel | Deploy web | ✅ Sí |
| Supabase | Base de datos + Realtime + Auth | ✅ Sí |
| Firebase FCM | Notificaciones push | ✅ Sí |
| Google Maps API | GPS, rutas, tiempo estimado | ⚠️ Crédito inicial USD $200/mes |
| Twilio | SMS / WhatsApp | ⚠️ De pago (opcional) |
| Expo | App Android | ✅ Sí |
| GitHub | Repositorio de código | ✅ Sí |
| Turborepo | Monorepo web + app | ✅ Sí |

---

*Documento generado: Marzo 2026*
