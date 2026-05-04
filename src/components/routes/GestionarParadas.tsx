"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { Table, Button, Space, Card, Typography, Select, notification, Spin, Modal } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title } = Typography;
const { Option } = Select;

interface Pasajero {
  id: string;
  nombre: string;
  direccionDomicilio: string;
  latDomicilio?: number;
  lngDomicilio?: number;
  nombreDestino?: string;
  direccionDestino?: string;
  latDestino?: number;
  lngDestino?: number;
  activo: boolean;
}

interface Parada {
  id: string;
  orden: number;
  pasajeroId: string;
  pasajero: Pasajero;
}

type StopPoint = { id: string; orden: number; nombre: string; direccion: string; lat: number; lng: number };
type DestinationPoint = { nombre: string; direccion: string; lat: number; lng: number };
type StartPoint = { tipo: "DOMICILIO_TRANSPORTISTA" | "VEHICULO"; direccion: string; comuna: string; lat: number; lng: number };

function buildStopsForMap(paradas: Parada[]): StopPoint[] {
  return paradas
    .map((p) => ({
      id: p.id,
      orden: p.orden,
      nombre: p.pasajero?.nombre ?? "Pasajero",
      direccion: p.pasajero?.direccionDomicilio ?? "",
      lat: p.pasajero?.latDomicilio,
      lng: p.pasajero?.lngDomicilio,
    }))
    .filter((s) => typeof s.lat === "number" && typeof s.lng === "number") as StopPoint[];
}

function pickDestination(paradas: Parada[]): DestinationPoint | null {
  const candidates = paradas
    .map((p) => ({
      nombre: p.pasajero?.nombreDestino ?? "Destino",
      direccion: p.pasajero?.direccionDestino ?? "",
      lat: p.pasajero?.latDestino,
      lng: p.pasajero?.lngDestino,
    }))
    .filter((d) => typeof d.lat === "number" && typeof d.lng === "number") as DestinationPoint[];

  if (candidates.length === 0) return null;

  const counts = new Map<string, { count: number; value: DestinationPoint }>();
  for (const d of candidates) {
    const key = `${d.lat.toFixed(5)}|${d.lng.toFixed(5)}`;
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { count: 1, value: d });
  }

  let best: { count: number; value: DestinationPoint } | null = null;
  for (const entry of counts.values()) {
    if (!best || entry.count > best.count) best = entry;
  }

  return best?.value ?? null;
}

async function fetchOsrmRoute(points: Array<[number, number]>) {
  if (points.length < 2) return null;

  const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data: unknown = await response.json();
  if (!data || typeof data !== "object") return null;

  const routes = (data as { routes?: Array<{ geometry?: { coordinates?: Array<[number, number]> } }> }).routes;
  const coordinates = routes?.[0]?.geometry?.coordinates;
  if (!coordinates?.length) return null;

  return coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
}

interface GestionarParadasProps {
  rutaId: string;
}

export default function GestionarParadas({ rutaId }: GestionarParadasProps) {
  const { user, logout } = useAuth();
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPasajero, setSelectedPasajero] = useState<string | null>(null);
  const [routeLine, setRouteLine] = useState<Array<[number, number]>>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [startPoint, setStartPoint] = useState<StartPoint | null>(null);

  const LeafletStopsMap = dynamic(async () => {
    const { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } = await import("react-leaflet");

    function computeBounds(points: Array<[number, number]>) {
      let minLat = points[0][0];
      let maxLat = points[0][0];
      let minLng = points[0][1];
      let maxLng = points[0][1];

      for (const [lat, lng] of points) {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }

      const padLat = (maxLat - minLat) * 0.1 || 0.01;
      const padLng = (maxLng - minLng) * 0.1 || 0.01;
      return [[minLat - padLat, minLng - padLng], [maxLat + padLat, maxLng + padLng]] as [
        [number, number],
        [number, number],
      ];
    }

    function SyncMapView({
      bounds,
      center,
    }: {
      bounds: [[number, number], [number, number]] | null;
      center: [number, number];
    }) {
      const map = useMap();
      const boundsKey = bounds ? `${bounds[0][0]},${bounds[0][1]}|${bounds[1][0]},${bounds[1][1]}` : "";
      const centerKey = `${center[0]},${center[1]}`;

      useEffect(() => {
        if (bounds) {
          map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16, animate: true });
          return;
        }
        map.setView(center, 14, { animate: true });
      }, [map, boundsKey, centerKey, bounds, center]);

      return null;
    }

    return function LeafletStopsMapInner({
      stops,
      start,
      destination,
      route,
      routePreview,
    }: {
      stops: StopPoint[];
      start: StartPoint | null;
      destination: { nombre: string; direccion: string; lat: number; lng: number } | null;
      route: Array<[number, number]>;
      routePreview: Array<[number, number]>;
    }) {
      const preview = routePreview.length > 1 ? routePreview : [];
      const routed = route.length > 1 ? route : [];
      const lineToDraw = routed.length > 0 ? routed : preview;

      const points: Array<[number, number]> = [
        ...(start ? ([[start.lat, start.lng]] as Array<[number, number]>) : []),
        ...stops.map((s) => [s.lat, s.lng] as [number, number]),
        ...(destination ? ([[destination.lat, destination.lng]] as Array<[number, number]>) : []),
        ...lineToDraw,
      ];
      const bounds = points.length > 1 ? computeBounds(points) : null;
      const center = points.length ? points[0] : ([-33.45, -70.65] as [number, number]);

      return (
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: 320, width: "100%", borderRadius: 8 }}
        >
          <SyncMapView bounds={bounds} center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {preview.length > 1 ? (
            <Polyline positions={preview} pathOptions={{ color: "#1677ff", weight: 4, dashArray: "6 10" }} />
          ) : null}
          {routed.length > 1 ? <Polyline positions={routed} pathOptions={{ color: "#52c41a", weight: 5 }} /> : null}
          {start ? (
            <CircleMarker center={[start.lat, start.lng]} radius={12} pathOptions={{ color: "#fa8c16" }}>
              <Popup>
                <div>
                  <div><strong>Inicio ({start.tipo === "VEHICULO" ? "Vehículo" : "Domicilio"})</strong></div>
                  <div>{`${start.direccion}${start.comuna ? `, ${start.comuna}` : ""}`}</div>
                  <div>{start.lat.toFixed(6)}, {start.lng.toFixed(6)}</div>
                </div>
              </Popup>
            </CircleMarker>
          ) : null}
          {stops.map((s) => (
            <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={10} pathOptions={{ color: "#1677ff" }}>
              <Popup>
                <div>
                  <div><strong>{s.orden}. {s.nombre}</strong></div>
                  <div>{s.direccion}</div>
                  <div>{s.lat.toFixed(6)}, {s.lng.toFixed(6)}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {destination ? (
            <CircleMarker
              center={[destination.lat, destination.lng]}
              radius={12}
              pathOptions={{ color: "#52c41a" }}
            >
              <Popup>
                <div>
                  <div><strong>Destino: {destination.nombre}</strong></div>
                  <div>{destination.direccion}</div>
                  <div>{destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}</div>
                </div>
              </Popup>
            </CircleMarker>
          ) : null}
        </MapContainer>
      );
    };
  }, { ssr: false });

  const fetchData = async () => {
    if (!user?.apiKey) return;
    try {
      setLoading(true);
      const rutaRes = await fetch(getApiUrl(`/api/v1/rutas/${rutaId}`), {
        headers: { "X-API-Key": user.apiKey },
      });
      if (rutaRes.status === 401) {
        logout();
        return;
      }
      if (!rutaRes.ok) throw new Error("Error al cargar la ruta");
      const rutaData: unknown = await rutaRes.json();

      const inicioTipo = (rutaData as { inicioTipo?: StartPoint["tipo"] | null }).inicioTipo ?? null;
      const inicioDireccion = (rutaData as { inicioDireccion?: string | null }).inicioDireccion ?? null;
      const inicioComuna = (rutaData as { inicioComuna?: string | null }).inicioComuna ?? null;
      const latInicio = (rutaData as { latInicio?: number | null }).latInicio ?? null;
      const lngInicio = (rutaData as { lngInicio?: number | null }).lngInicio ?? null;
      if (
        (inicioTipo === "VEHICULO" || inicioTipo === "DOMICILIO_TRANSPORTISTA") &&
        typeof inicioDireccion === "string" &&
        typeof latInicio === "number" &&
        typeof lngInicio === "number"
      ) {
        setStartPoint({
          tipo: inicioTipo,
          direccion: inicioDireccion,
          comuna: typeof inicioComuna === "string" ? inicioComuna : "",
          lat: latInicio,
          lng: lngInicio,
        });
      } else {
        setStartPoint(null);
      }

      const paradasRes = await fetch(getApiUrl(`/api/v1/rutas/${rutaId}/paradas`), {
        headers: { "X-API-Key": user.apiKey },
      });

      if (paradasRes.status === 401) {
        logout();
        return;
      }
      if (!paradasRes.ok) throw new Error("Error al cargar datos");

      const paradasData = await paradasRes.json();
      setParadas(paradasData);

      if (user.rol === "TRANSPORTISTA") {
        const pasajerosRes = await fetch(getApiUrl("/api/v1/pasajeros"), { headers: { "X-API-Key": user.apiKey } });
        if (pasajerosRes.status === 401) {
          logout();
          return;
        }
        if (!pasajerosRes.ok) throw new Error("Error al cargar pasajeros");

        const pasajerosData = await pasajerosRes.json();
        setPasajeros((pasajerosData as Pasajero[]).filter((p) => p.activo !== false));
      } else {
        setPasajeros([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: "Error", description: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rutaId, user?.apiKey]);

  const handleAddParada = async () => {
    if (!selectedPasajero || !user?.apiKey) return;
    if (user.rol !== "TRANSPORTISTA") return;
    try {
      const response = await fetch(getApiUrl(`/api/v1/rutas/${rutaId}/paradas`), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": user.apiKey },
        body: JSON.stringify({ pasajeroId: selectedPasajero, orden: paradas.length + 1 }),
      });

      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) throw new Error("Error al añadir parada");
      
      setSelectedPasajero(null);
      fetchData();
      notification.success({ message: "Parada añadida" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: "Error", description: err.message });
      }
    }
  };

  const handleDeleteParada = (paradaId: string) => {
    Modal.confirm({
      title: "¿Eliminar esta parada de la ruta?",
      onOk: async () => {
        if (!user?.apiKey) return;
        if (user.rol !== "TRANSPORTISTA") return;
        try {
          const response = await fetch(getApiUrl(`/api/v1/rutas/${rutaId}/paradas/${paradaId}`), {
            method: "DELETE",
            headers: { "X-API-Key": user.apiKey },
          });
          if (response.status === 401) {
            logout();
            return;
          }
          if (!response.ok) throw new Error("Error al eliminar");
          fetchData();
          notification.success({ message: "Parada eliminada" });
        } catch (err: unknown) {
          if (err instanceof Error) {
            notification.error({ message: "Error", description: err.message });
          }
        }
      },
    });
  };

  const handleReorder = async (paradaId: string, direction: 'up' | 'down') => {
    if (!user?.apiKey) return;
    if (user.rol !== "TRANSPORTISTA") return;
    const index = paradas.findIndex(p => p.id === paradaId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === paradas.length - 1)) return;

    const newParadas = [...paradas];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newParadas[index], newParadas[targetIndex]] = [newParadas[targetIndex], newParadas[index]];

    // Actualizar orden localmente y enviar a API
    const updatePayload = newParadas.map((p, i) => ({ id: p.id, orden: i + 1 }));

    try {
      const response = await fetch(getApiUrl(`/api/v1/rutas/${rutaId}/paradas`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-API-Key": user.apiKey },
        body: JSON.stringify(updatePayload),
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) throw new Error("Error al reordenar");
      setParadas(newParadas);
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: "Error", description: err.message });
      }
    }
  };

  const columns = [
    { title: "Orden", dataIndex: "orden", key: "orden", width: 80 },
    { title: "Pasajero", key: "pasajero", render: (record: Parada) => record.pasajero.nombre },
    { title: "Dirección", key: "direccion", render: (record: Parada) => record.pasajero.direccionDomicilio },
    {
      title: "Acciones",
      key: "actions",
      render: (record: Parada) => (
        <Space>
          <Button icon={<ArrowUpOutlined />} onClick={() => handleReorder(record.id, 'up')} disabled={user?.rol !== "TRANSPORTISTA" || record.orden === 1} />
          <Button icon={<ArrowDownOutlined />} onClick={() => handleReorder(record.id, 'down')} disabled={user?.rol !== "TRANSPORTISTA" || record.orden === paradas.length} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteParada(record.id)} disabled={user?.rol !== "TRANSPORTISTA"} />
        </Space>
      ),
    },
  ];

  const stopsForMap = buildStopsForMap(paradas);
  const destination = pickDestination(paradas);
  const routePreview: Array<[number, number]> = [
    ...(startPoint ? ([[startPoint.lat, startPoint.lng]] as Array<[number, number]>) : []),
    ...stopsForMap.map((s) => [s.lat, s.lng] as [number, number]),
    ...(destination ? ([[destination.lat, destination.lng]] as Array<[number, number]>) : []),
  ];

  useEffect(() => {
    const compute = async () => {
      const stops = buildStopsForMap(paradas);
      const dest = pickDestination(paradas);
      const start = startPoint;

      if (!start && stops.length < 2 && !dest) {
        setRouteLine([]);
        return;
      }

      const routePoints: Array<[number, number]> = [
        ...(start ? ([[start.lat, start.lng]] as Array<[number, number]>) : []),
        ...stops.map((s) => [s.lat, s.lng] as [number, number]),
        ...(dest ? ([[dest.lat, dest.lng]] as Array<[number, number]>) : []),
      ];

      if (routePoints.length < 2) {
        setRouteLine([]);
        return;
      }

      setRouteLoading(true);
      try {
        const osrm = await fetchOsrmRoute(routePoints);
        setRouteLine(osrm ?? routePoints);
      } finally {
        setRouteLoading(false);
      }
    };

    void compute();
  }, [paradas, startPoint]);

  return (
    <Card>
      <Title level={4}>Gestionar Paradas de la Ruta</Title>
      <Spin spinning={loading} tip="Cargando paradas...">
        {stopsForMap.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            <Spin spinning={routeLoading} tip="Calculando ruta...">
              <LeafletStopsMap
                stops={stopsForMap}
                start={startPoint}
                destination={destination}
                route={routeLine}
                routePreview={routePreview}
              />
            </Spin>
          </div>
        ) : null}
        {user?.rol === "TRANSPORTISTA" ? (
          <Space style={{ marginBottom: 16 }}>
            <Select
              style={{ width: 300 }}
              placeholder="Seleccionar pasajero para añadir"
              value={selectedPasajero}
              onChange={setSelectedPasajero}
            >
              {pasajeros.filter(p => !paradas.some(pa => pa.pasajeroId === p.id)).map(p => (
                <Option key={p.id} value={p.id}>{p.nombre}</Option>
              ))}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddParada} disabled={!selectedPasajero}>
              Añadir Parada
            </Button>
          </Space>
        ) : null}
        <Table columns={columns} dataSource={paradas} rowKey="id" pagination={false} />
      </Spin>
    </Card>
  );
}
