# Documentación de Endpoints - Ruta Segura

Esta documentación detalla los endpoints disponibles en la API de Ruta Segura Administrador, organizados por módulos.

## Autenticación

La mayoría de los endpoints requieren autenticación mediante una **API Key**. Esta clave se obtiene al registrarse o iniciar sesión.

### Métodos de Autenticación
Debes incluir la API Key en las cabeceras de cada petición (excepto login y registro):
- **Header:** `X-API-Key: <tu_api_key>`
- **Header:** `Authorization: Bearer <tu_api_key>`

---

## 🔐 Módulo: Autenticación (Auth)

### Registrar Usuario
Crea una nueva cuenta de usuario (por defecto rol `TRANSPORTISTA`).
- **Endpoint:** `POST /api/v1/auth/register`
- **Body (JSON):**
  ```json
  {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "telefono": "+56912345678"
  }
  ```
- **Respuesta (201):** `{ "user": { ... }, "apiKey": "..." }`

### Iniciar Sesión
Obtiene una API Key válida para un usuario existente.
- **Endpoint:** `POST /api/v1/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "juan@example.com",
    "password": "password123"
  }
  ```
- **Respuesta (200):** `{ "user": { ... }, "apiKey": "..." }`

### Obtener Mi Perfil
Obtiene los datos del usuario autenticado actualmente.
- **Endpoint:** `GET /api/v1/auth/me`
- **Autenticación:** Requerida.
- **Respuesta (200):** `{ "user": { ... } }`

### Olvidé mi Contraseña
Solicita un token de restablecimiento de contraseña.
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Body (JSON):**
  ```json
  {
    "email": "juan@example.com"
  }
  ```
- **Respuesta (200):** `{ "message": "Si el correo está registrado..." }`

### Restablecer Contraseña
Cambia la contraseña usando el token recibido.
- **Endpoint:** `POST /api/v1/auth/reset-password`
- **Body (JSON):**
  ```json
  {
    "email": "juan@example.com",
    "token": "123456",
    "newPassword": "nueva_password_123"
  }
  ```
- **Respuesta (200):** `{ "message": "Contraseña restablecida con éxito" }`

---

## 🚍 Módulo: Transportistas

### Listar Transportistas
Obtiene todos los usuarios con el rol `TRANSPORTISTA`.
- **Endpoint:** `GET /api/v1/transportistas`
- **Autenticación:** Requerida.

---

## 👥 Módulo: Pasajeros

### Listar Pasajeros
- **Endpoint:** `GET /api/v1/pasajeros`
- **Autenticación:** Requerida.

### Crear Pasajero
- **Endpoint:** `POST /api/v1/pasajeros`
- **Autenticación:** Requerida.
- **Body (JSON):**
  ```json
  {
    "nombre": "María López",
    "telefono": "+56987654321",
    "direccionDomicilio": "Calle Falsa 123",
    "latDomicilio": -33.456,
    "lngDomicilio": -70.648,
    "nombreDestino": "Colegio ABC",
    "direccionDestino": "Av. Principal 456",
    "latDestino": -33.460,
    "lngDestino": -70.650,
    "contactos": [
      {
        "nombre": "Padre María",
        "telefono": "+56911112222",
        "canal": "WHATSAPP"
      }
    ]
  }
  ```

### Detalles/Actualizar/Eliminar Pasajero
- **GET / PUT / DELETE:** `/api/v1/pasajeros/[id]`
- **Autenticación:** Requerida.

---

## 🗺️ Módulo: Rutas y Paradas

### Listar/Crear Rutas
- **GET / POST:** `/api/v1/rutas`
- **Autenticación:** Requerida.
- **Body (POST):** `{ "nombre": "Ruta Mañana", "tipo": "IDA", "transportistaId": "..." }`

### Detalles/Actualizar/Eliminar Ruta
- **GET / PUT / DELETE:** `/api/v1/rutas/[id]`
- **Autenticación:** Requerida.

### Gestionar Paradas de una Ruta
- **GET:** `/api/v1/rutas/[id]/paradas` (Listar)
- **POST:** `/api/v1/rutas/[id]/paradas` (Añadir: `{ "orden": 1, "pasajeroId": "..." }`)
- **PUT:** `/api/v1/rutas/[id]/paradas` (Reordenar: `[{ "id": "...", "orden": 2 }, ...]`)
- **DELETE:** `/api/v1/rutas/[id]/paradas/[paradaId]` (Eliminar parada específica)
- **Autenticación:** Requerida.

---

## 🚀 Módulo: Viajes

### Listar/Crear Viajes
- **GET / POST:** `/api/v1/viajes`
- **Autenticación:** Requerida.
- **Body (POST):** `{ "rutaId": "...", "fecha": "2026-04-15T08:00:00Z" }`

### Detalles/Actualizar/Eliminar Viaje
- **GET / PUT / DELETE:** `/api/v1/viajes/[id]`
- **Autenticación:** Requerida.
- **Body (PUT):** `{ "estado": "EN_CURSO", "fecha": "..." }`

### Actualizar Ubicación en Tiempo Real
Permite al transportista enviar su ubicación GPS durante un viaje activo.
- **Endpoint:** `POST /api/v1/viajes/[id]/location`
- **Autenticación:** Requerida.
- **Condición:** El viaje debe estar en estado `EN_CURSO`.
- **Body (JSON):**
  ```json
  {
    "lat": -33.45678,
    "lng": -70.64821
  }
  ```
