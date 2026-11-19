"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface PosicionViaje {
  id: string;
  lat: number;
  lng: number;
  ruta: string;
  transportista: string;
}

const busIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#1565e8;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FitBounds({ puntos }: { puntos: PosicionViaje[] }) {
  const map = useMap();
  useEffect(() => {
    if (puntos.length === 0) return;
    if (puntos.length === 1) {
      map.setView([puntos[0].lat, puntos[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(puntos.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
  }, [map, puntos]);
  return null;
}

export default function DashboardViajesMap({ puntos }: { puntos: PosicionViaje[] }) {
  if (puntos.length === 0) {
    return null;
  }

  const center: [number, number] = [puntos[0].lat, puntos[0].lng];

  return (
    <MapContainer center={center} zoom={13} style={{ height: 320, width: "100%", borderRadius: 8 }} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds puntos={puntos} />
      {puntos.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={busIcon}>
          <Popup>
            <strong>{p.ruta}</strong>
            <br />
            {p.transportista}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}