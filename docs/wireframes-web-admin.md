# 🖼️ Wireframes — Panel de Administración Web (RutaSegura)

Este documento describe la estructura visual y funcional del Panel Web de Administración.

## 1. Conceptos de Diseño
- **Framework UI:** Ant Design (antd)
- **Tema:** Limpio, profesional, colores corporativos (Azul/Blanco).
- **Navegación:** Menú lateral izquierdo (Sider).

---

## 2. Estructura General (Layout)

```text
+-------------------------------------------------------------+
| [LOGO] RutaSegura | [Buscador] | [🔔] [👤 Admin] | Header  |
+-------------------+-----------------------------------------+
|                   |                                         |
| [🏠 Dashboard]    |         CONTENIDO PRINCIPAL             |
| [🚐 Transportes]  |       (Dashboard / Listas / etc)        |
| [👥 Pasajeros]    |                                         |
| [🛣️ Rutas]        |                                         |
| [🔔 Notificaciones]|                                         |
| [📊 Reportes]     |                                         |
|                   |                                         |
| [⚙️ Config]       |                                         |
| [🚪 Salir]        |                                         |
|                   |                                         |
|      SIDER        |                CONTENT                  |
+-------------------+-----------------------------------------+
```

---

## 3. Detalle de Pantallas

### A. Dashboard Principal
- **KPIs (Cards):**
  - Rutas Activas Hoy.
  - Total Pasajeros.
  - Transportistas Disponibles.
  - Notificaciones enviadas hoy.
- **Mapa en Tiempo Real:** Visualización de transportistas en movimiento.
- **Alertas Recientes:** Tabla con las últimas notificaciones críticas.

### B. Gestión de Pasajeros (Tabla CRUD)
- **Columnas:** Foto, Nombre, Dirección (Domicilio), Destino, Contactos, Estado (Activo/Inactivo).
- **Acciones:** Editar, Eliminar, Ver Detalles, Asignar a Ruta.
- **Filtros:** Por nombre, por ruta, por tipo de viaje (Ida/Vuelta).

### C. Gestión de Transportistas (Tabla CRUD)
- **Columnas:** Nombre, Patente Vehículo, Capacidad, Teléfono, Estado.
- **Acciones:** Editar, Eliminar, Ver Historial de Viajes.

### D. Gestión de Rutas
- **Mapa Interactivo:** Dibujar o ver paradas en el mapa.
- **Lista de Paradas:** Arrastrar y soltar para reordenar (Drag & Drop).
- **Horarios:** Configuración de horas estimadas de recogida.

### E. Logs de Notificaciones
- Historial detallado de cada mensaje enviado (Canal, Destinatario, Timestamp, Estado de entrega).

---

## 4. Flujos de Usuario Críticos

1. **Crear Ruta Nueva:**
   - Seleccionar Transportista.
   - Seleccionar Pasajeros.
   - Definir orden de paradas en el mapa.
   - Guardar y activar.

2. **Monitoreo en Vivo:**
   - Seleccionar una ruta activa.
   - Ver posición GPS del transportista en el mapa.
   - Ver por qué parada va el conductor.
