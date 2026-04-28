# Documentación de Endpoints - Ruta Segura (Administrador)

API HTTP para app móvil y frontend administrador.

## Base URL

- En desarrollo: `http://localhost:3000`
- Prefijo API: `/api/v1`

## Autenticación (API Key)

La mayoría de los endpoints requieren una **API Key** válida.

### ¿Dónde obtengo la API Key?

- **Por usuario (recomendado):** usando `POST /api/v1/auth/login` o `POST /api/v1/auth/register` (ambos devuelven `apiKey`).
- **Clave compartida (según este repo):** el valor está guardado en el archivo `docs/apikey-rutasegura.txt`.

Por seguridad, este documento no copia la API Key en texto plano. Para usarla, lee el contenido del archivo anterior y envíalo en el header correspondiente.

### Headers aceptados

- **Preferido / ampliamente soportado:** `X-API-Key: <api_key>`
- **También soportado en algunos endpoints:** `Authorization: Bearer <api_key>`

Nota: algunos endpoints del backend validan solo `X-API-Key` (no aceptan `Authorization`).

### Respuestas de error comunes

- `401` `{ "error": "API Key inválida" }` o `{ "error": "No autorizado" }`
- `400` `{ "error": [...] }` cuando la validación del body falla (Zod issues)
- `404` `{ "error": "..." }` cuando un recurso no existe
- `500` `{ "error": "..." }` error interno

---

## Módulo: Autenticación (Auth)

### POST `/api/v1/auth/register`

- **Objetivo:** crear un usuario nuevo y devolver una API Key inicial.
- **API Key:** no requerida.
- **Body (JSON):**
  ```json
  {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "telefono": "+56912345678"
  }
  ```
- **Parámetros:** ninguno.
- **Respuestas:**
  - `201` `{ "user": { ... }, "apiKey": "..." }`
  - `400` `{ "error": "El email ya está en uso" }` o `{ "error": [...] }`

### POST `/api/v1/auth/login`

- **Objetivo:** autenticar credenciales y devolver una API Key nueva (se refresca en cada login).
- **API Key:** no requerida.
- **Body (JSON):**
  ```json
  {
    "email": "juan@example.com",
    "password": "password123"
  }
  ```
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `{ "user": { ... }, "apiKey": "..." }`
  - `401` `{ "error": "Credenciales inválidas" }`
  - `400` `{ "error": [...] }`

### GET `/api/v1/auth/me`

- **Objetivo:** obtener el perfil del usuario autenticado.
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `{ "user": { ... } }`
  - `401` `{ "error": "No autorizado", "message": "..." }`

### PATCH `/api/v1/auth/profile`

- **Objetivo:** actualizar datos del perfil del usuario autenticado.
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Body (JSON):** todos opcionales
  ```json
  {
    "nombre": "Nuevo Nombre",
    "telefono": "+56999999999",
    "foto": "https://example.com/avatar.png"
  }
  ```
  - `foto` puede ser `null`.
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `{ "user": { ... } }`
  - `400` `{ "error": [...] }`
  - `401` `{ "error": "No autorizado" }` o `{ "error": "Sesión inválida" }`

### POST `/api/v1/auth/change-password`

- **Objetivo:** cambiar la contraseña del usuario autenticado.
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Body (JSON):**
  ```json
  {
    "currentPassword": "passwordActual",
    "newPassword": "passwordNueva123"
  }
  ```
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `{ "message": "Contraseña actualizada con éxito" }`
  - `400` `{ "error": "La contraseña actual es incorrecta" }` o `{ "error": [...] }`
  - `401` `{ "error": "No autorizado" }` o `{ "error": "Sesión inválida" }`

### POST `/api/v1/auth/forgot-password`

- **Objetivo:** solicitar un token de restablecimiento (6 dígitos).
- **API Key:** no requerida.
- **Body (JSON):**
  ```json
  {
    "email": "juan@example.com"
  }
  ```
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `{ "message": "Si el correo está registrado, ..." }`
  - En desarrollo: también puede incluir `_dev_token` cuando `NODE_ENV !== "production"`.
  - `400` `{ "error": [...] }`

### POST `/api/v1/auth/reset-password`

- **Objetivo:** restablecer contraseña usando `email + token + newPassword`.
- **API Key:** no requerida.
- **Body (JSON):**
  ```json
  {
    "email": "juan@example.com",
    "token": "123456",
    "newPassword": "nueva_password_123"
  }
  ```
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `{ "message": "Contraseña restablecida con éxito" }`
  - `400` `{ "error": "Token inválido o expirado" }` o `{ "error": [...] }`

---

## Módulo: Transportistas

### GET `/api/v1/transportistas`

- **Objetivo:** listar usuarios con rol `TRANSPORTISTA`.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `[ { ...transportista } ]`
  - `401` `{ "error": "API Key inválida" }`

---

## Módulo: Pasajeros

### GET `/api/v1/pasajeros`

- **Objetivo:** listar pasajeros del transportista autenticado.
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `[ { ...pasajero, contactos: [...] } ]`

### POST `/api/v1/pasajeros`

- **Objetivo:** crear un pasajero asociado al transportista autenticado.
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Body (JSON):**
  ```json
  {
    "nombre": "María López",
    "telefono": "+56987654321",
    "foto": "https://example.com/foto.jpg",
    "direccionDomicilio": "Calle Falsa 123",
    "numeroDepto": "1204",
    "latDomicilio": -33.456,
    "lngDomicilio": -70.648,
    "instruccionesDomicilio": "Tocar timbre",
    "nombreDestino": "Colegio ABC",
    "direccionDestino": "Av. Principal 456",
    "latDestino": -33.46,
    "lngDestino": -70.65,
    "contactos": [
      {
        "nombre": "Padre María",
        "telefono": "+56911112222",
        "email": "padre@example.com",
        "canal": "WHATSAPP"
      }
    ]
  }
  ```
  - `contactos[].canal`: `PUSH | SMS | WHATSAPP` (default `PUSH`).
- **Parámetros:** ninguno.
- **Respuestas:**
  - `201` `{ ...pasajero, contactos: [...] }`
  - `400` `{ "error": [...] }`

### GET `/api/v1/pasajeros/:id`

- **Objetivo:** obtener un pasajero (solo si pertenece al transportista autenticado).
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Respuestas:**
  - `200` `{ ...pasajero, contactos: [...] }`
  - `404` `{ "error": "Pasajero no encontrado" }`

### PUT `/api/v1/pasajeros/:id`

- **Objetivo:** actualizar datos del pasajero (y opcionalmente reemplazar contactos).
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Body (JSON):** todos los campos son opcionales; si envías `contactos`, reemplaza todos los contactos
  ```json
  {
    "telefono": "+56900001111",
    "direccionDomicilio": "Nueva dirección",
    "contactos": [
      { "nombre": "Nuevo Contacto", "telefono": "+56922223333", "canal": "PUSH" }
    ]
  }
  ```
- **Respuestas:**
  - `200` `{ ...pasajero, contactos: [...] }`
  - `400` `{ "error": [...] }`
  - `404` `{ "error": "Pasajero no encontrado" }`

### PATCH `/api/v1/pasajeros/:id`

- **Objetivo:** activar/desactivar un pasajero.
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Body (JSON):**
  ```json
  { "activo": false }
  ```
- **Respuestas:**
  - `200` `{ ...pasajero, activo: false, contactos: [...] }`
  - `400` `{ "error": [...] }`
  - `404` `{ "error": "Pasajero no encontrado" }`

### DELETE `/api/v1/pasajeros/:id`

- **Objetivo:** eliminar un pasajero (solo si pertenece al transportista autenticado).
- **API Key:** requerida.
  - `X-API-Key: <api_key>` o `Authorization: Bearer <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Respuestas:**
  - `204` sin body
  - `404` `{ "error": "Pasajero no encontrado" }`

---

## Módulo: Rutas

### GET `/api/v1/rutas`

- **Objetivo:** listar rutas.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `[ { ...ruta, transportista: {...}, paradas: [...] } ]`

### POST `/api/v1/rutas`

- **Objetivo:** crear una ruta.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Body (JSON):**
  ```json
  {
    "nombre": "Ruta Mañana",
    "tipo": "IDA",
    "transportistaId": "ckxxxxxxxxxxxxxxxxxxxxxxx"
  }
  ```
  - `tipo`: `IDA | VUELTA | IDA_Y_VUELTA` (opcional).
- **Respuestas:**
  - `201` `{ ...ruta }`
  - `400` `{ "error": [...] }`

### GET `/api/v1/rutas/:id`

- **Objetivo:** obtener detalle de una ruta (incluye transportista y paradas ordenadas).
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Respuestas:**
  - `200` `{ ...ruta, transportista: {...}, paradas: [...] }`
  - `404` `{ "error": "Ruta no encontrada" }`

### PUT `/api/v1/rutas/:id`

- **Objetivo:** actualizar una ruta.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Body (JSON):** campos opcionales
  ```json
  {
    "nombre": "Ruta Actualizada",
    "tipo": "VUELTA",
    "transportistaId": "ckxxxxxxxxxxxxxxxxxxxxxxx"
  }
  ```
- **Respuestas:**
  - `200` `{ ...ruta }`
  - `400` `{ "error": [...] }`
  - `404` `{ "error": "Ruta no encontrada" }`

### DELETE `/api/v1/rutas/:id`

- **Objetivo:** eliminar una ruta.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Respuestas:**
  - `204` sin body
  - `404` `{ "error": "Ruta no encontrada" }`

---

## Módulo: Paradas (Stops) de una Ruta

### GET `/api/v1/rutas/:id/paradas`

- **Objetivo:** listar paradas de una ruta (orden ascendente).
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string) = `rutaId`
- **Respuestas:**
  - `200` `[ { ...parada, pasajero: {...} } ]`

### POST `/api/v1/rutas/:id/paradas`

- **Objetivo:** crear una parada dentro de una ruta.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string) = `rutaId`
- **Body (JSON):**
  ```json
  { "pasajeroId": "ckxxxxxxxxxxxxxxxxxxxxxxx", "orden": 1 }
  ```
- **Respuestas:**
  - `201` `{ ...parada }`
  - `400` `{ "error": [...] }`

### PUT `/api/v1/rutas/:id/paradas`

- **Objetivo:** reordenar paradas de una ruta.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string) = `rutaId`
- **Body (JSON):**
  ```json
  [
    { "id": "ckparada1xxxxxxxxxxxxxxxxxx", "orden": 1 },
    { "id": "ckparada2xxxxxxxxxxxxxxxxxx", "orden": 2 }
  ]
  ```
- **Respuestas:**
  - `200` `{ "message": "Paradas reordenadas con éxito" }`
  - `400` `{ "error": [...] }`

### DELETE `/api/v1/rutas/:id/paradas/:paradaId`

- **Objetivo:** eliminar una parada específica de una ruta.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string) = `rutaId`
  - `paradaId` (string)
- **Respuestas:**
  - `204` sin body
  - `404` `{ "error": "Parada no encontrada en esta ruta" }`

---

## Módulo: Viajes

### GET `/api/v1/viajes`

- **Objetivo:** listar viajes (ordenados por `fecha desc`) incluyendo ruta, transportista, paradas y notificaciones.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros:** ninguno.
- **Respuestas:**
  - `200` `[ { ...viaje, ruta: {...}, notificaciones: [...] } ]`

### POST `/api/v1/viajes`

- **Objetivo:** crear un viaje (estado inicial `PENDIENTE`).
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Body (JSON):**
  ```json
  { "rutaId": "ckxxxxxxxxxxxxxxxxxxxxxxx", "fecha": "2026-04-15T08:00:00.000Z" }
  ```
  - `fecha` es opcional; si no se envía, el backend usa `new Date()`.
- **Respuestas:**
  - `201` `{ ...viaje }`
  - `400` `{ "error": [...] }`

### GET `/api/v1/viajes/:id`

- **Objetivo:** obtener un viaje con su detalle (ruta, transportista, paradas, pasajeros, notificaciones).
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Respuestas:**
  - `200` `{ ...viaje }`
  - `404` `{ "error": "Viaje no encontrado" }`

### PUT `/api/v1/viajes/:id`

- **Objetivo:** actualizar el estado de un viaje.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Body (JSON):**
  ```json
  { "estado": "EN_CURSO" }
  ```
  - `estado`: `PENDIENTE | EN_CURSO | COMPLETADO | CANCELADO`
- **Respuestas:**
  - `200` `{ ...viaje }`
  - `400` `{ "error": [...] }`
  - `404` `{ "error": "Viaje no encontrado" }`

### DELETE `/api/v1/viajes/:id`

- **Objetivo:** eliminar un viaje.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Parámetros (path):**
  - `id` (string)
- **Respuestas:**
  - `204` sin body
  - `404` `{ "error": "Viaje no encontrado" }`

### POST `/api/v1/viajes/:id/location`

- **Objetivo:** enviar ubicación GPS durante un viaje activo.
- **API Key:** requerida.
  - Solo `X-API-Key: <api_key>`
- **Condición:** el viaje debe estar en estado `EN_CURSO`.
- **Parámetros (path):**
  - `id` (string) = `viajeId`
- **Body (JSON):**
  ```json
  { "lat": -33.45678, "lng": -70.64821 }
  ```
- **Respuestas:**
  - `200` `{ "message": "Ubicación recibida" }`
  - `400` `{ "error": [...] }`
  - `404` `{ "error": "Viaje no encontrado o no está en curso" }`
