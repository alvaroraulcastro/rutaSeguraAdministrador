"use client";

import React, { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from "react-leaflet";

export type StopPoint = { id: string; orden: number; nombre: string; direccion: string; lat: number; lng: number };
export type DestinationPoint = { nombre: string; direccion: string; lat: number; lng: number };
export type StartPoint = {
  tipo: "DOMICILIO_TRANSPORTISTA" | "VEHICULO";
  direccion: string;
  comuna: string;
  lat: number;
  lng: number;
};

export interface LeafletStopsMapProps {
  stops: StopPoint[];
  start: StartPoint | null;
  destination: DestinationPoint | null;
  route: Array<[number, number]>;
  routePreview: Array<[number, number]>;
}

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
  return [
    [minLat - padLat, minLng - padLng],
    [maxLat + padLat, maxLng + padLng],
  ] as [[number, number], [number, number]];
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

export default function LeafletStopsMap({
  stops,
  start,
  destination,
  route,
  routePreview,
}: LeafletStopsMapProps) {
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
              <div>
                <strong>Inicio ({start.tipo === "VEHICULO" ? "Vehículo" : "Domicilio"})</strong>
              </div>
              <div>{`${start.direccion}${start.comuna ? `, ${start.comuna}` : ""}`}</div>
              <div>
                {start.lat.toFixed(6)}, {start.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ) : null}
      {stops.map((s) => (
        <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={10} pathOptions={{ color: "#1677ff" }}>
          <Popup>
            <div>
              <div>
                <strong>
                  {s.orden}. {s.nombre}
                </strong>
              </div>
              <div>{s.direccion}</div>
              <div>
                {s.lat.toFixed(6)}, {s.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {destination ? (
        <CircleMarker center={[destination.lat, destination.lng]} radius={12} pathOptions={{ color: "#52c41a" }}>
          <Popup>
            <div>
              <div>
                <strong>Destino: {destination.nombre}</strong>
              </div>
              <div>{destination.direccion}</div>
              <div>
                {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ) : null}
    </MapContainer>
  );
}