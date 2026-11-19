# Datos demo ficticios — RutaSegura

Información **inventada** para pruebas del panel y la API. No corresponde a personas reales.

## Credenciales

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@rutasegura.com | admin123 | ADMIN |
| juan.perez@example.com | driver123 | TRANSPORTISTA |
| maria.gonzalez@example.com | driver123 | TRANSPORTISTA |
| carlos.vega@example.com | driver123 | TRANSPORTISTA |

Tras cada login se genera una **nueva API Key** (comportamiento del sistema).

## Transportistas ficticios

| Nombre | Patente | Vehículo | Capacidad | Pasajeros asignados |
|--------|---------|----------|-----------|-------------------|
| Juan Pérez | ABCD-12 | Hyundai H1 | 12 | Andrés, Sofía, Matías + Lucas (inactivo) |
| María González | FGHI-34 | Mercedes Sprinter | 15 | Valentina, Benjamín, Isidora |
| Carlos Vega | JKLM-56 | Toyota Hiace | 14 | Tomás, Catalina |

## Pasajeros (resumen)

- **9 registros** (8 activos, 1 inactivo: Lucas Pino).
- Domicilios y colegios en **Santiago** (Providencia, Las Condes, Ñuñoa, Macul, etc.).
- Contactos con canal **PUSH**, **SMS** o **WhatsApp** según el caso.
- Tres contactos con **`fcmToken` demo** (mismo token ficticio; no envía push real).

## Rutas ficticias

1. Ruta Mañana Vitacura (IDA) — Juan — 3 paradas  
2. Ruta Tarde Ñuñoa (VUELTA) — Juan — 3 paradas  
3. Ruta Oriente Las Condes (IDA) — María — 3 paradas  
4. Circuito Macul ida y vuelta — María — 2 paradas  
5. Ruta Carlos — Providencia centro (IDA) — Carlos — 2 paradas  

## Viajes de ejemplo (tras seed)

| Estado | Ruta | Uso en panel |
|--------|------|----------------|
| EN_CURSO | Vitacura | Dashboard mapa GPS, notificaciones recientes |
| PENDIENTE | Las Condes | Probar “Iniciar viaje” en `/trips` |
| COMPLETADO | Carlos AM | Reportes / historial |
| CANCELADO | Ñuñoa tarde | Filtro por estado |
| COMPLETADO (ayer) | Macul | Reportes 7 días |

## Notificaciones de ejemplo

- 4 alertas ligadas al viaje **en curso** (EN_CAMINO, EN_PUERTA, mix de canales).
- 1 alerta **FALLIDO** (SMS) en viaje completado — útil para KPI en `/reports`.

## Cargar en base de datos

**Requisito:** archivo `.env.local` con `POSTGRES_URL` (copia desde `.env.example`) y PostgreSQL en ejecución.

```bash
npx prisma db push
# Destructivo (borra y recrea todo el demo)
npx prisma db seed

# Staging: no borrar si ya hay datos
PRISMA_SEED_DESTRUCTIVE=false npx prisma db seed
```

Fuente de datos en código: [`prisma/seed-data.ts`](../prisma/seed-data.ts).

## Token FCM demo

Los contactos marcados con push de prueba usan un token largo ficticio (`FCM_TOKEN_DEMO` en seed). Solo sirve para probar el flujo con `FCM_SERVER_KEY` configurada; no es un dispositivo real.