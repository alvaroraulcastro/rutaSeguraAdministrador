# Diagrama de Entidad-Relación (ER)

Este diagrama representa la estructura de la base de datos para la aplicación **RutaSegura**, incluyendo el flujo de usuarios y logs de peticiones.

```mermaid
erDiagram
    USUARIO ||--o{ RUTA : gestiona
    USUARIO ||--o{ LOG_PETICION : genera
    PASAJERO ||--o{ CONTACTO_NOTIFICACION : tiene
    PASAJERO ||--o{ PARADA : asignado
    RUTA ||--o{ PARADA : contiene
    RUTA ||--o{ VIAJE : programa
    VIAJE ||--o{ NOTIFICACION_LOG : registra
    PASAJERO ||--o{ NOTIFICACION_LOG : recibe

    USUARIO {
        string id PK
        string nombre
        string email
        string password
        enum rol
        string telefono
        string patente
        string modelo
        int capacidad
    }

    LOG_PETICION {
        string id PK
        string metodo
        string endpoint
        string ip
        string userAgent
        string payload
        string usuarioId FK
        datetime fecha
    }

    PASAJERO {
        string id PK
        string nombre
        string telefono
        string direccionDomicilio
        string numeroDepto
        float latDomicilio
        float lngDomicilio
        string nombreDestino
        string direccionDestino
        float latDestino
        float lngDestino
    }

    CONTACTO_NOTIFICACION {
        string id PK
        string nombre
        string telefono
        string email
        enum canal
        string pasajeroId FK
    }

    RUTA {
        string id PK
        string nombre
        enum tipo
        string transportistaId FK
    }

    PARADA {
        string id PK
        int orden
        string rutaId FK
        string pasajeroId FK
    }

    VIAJE {
        string id PK
        string rutaId FK
        datetime fecha
        enum estado
    }

    NOTIFICACION_LOG {
        string id PK
        string mensaje
        enum canal
        string viajeId FK
        string pasajeroId FK
        datetime enviadoEn
    }
```

## Descripción de Entidades

- **Usuario**: Representa tanto a administradores como a transportistas. Incluye credenciales para el flujo de registro y login. Si el rol es `TRANSPORTISTA`, se completan los campos de vehículo (`patente`, `modelo`, `capacidad`).
- **LogPeticion**: Registra cada petición realizada por los usuarios a la API para auditoría y seguridad.
- **Pasajero**: Persona transportada con información de origen y destino.
- **ContactoNotificacion**: Tutores o familiares asociados a un pasajero.
- **Ruta**: Trayecto programado asignado a un transportista.
- **Parada**: Orden de visita de pasajeros dentro de una ruta.
- **Viaje**: Ejecución diaria o puntual de una ruta.
- **NotificacionLog**: Historial de alertas enviadas durante los viajes.
