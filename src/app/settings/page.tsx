import { createMetadata } from "@/lib/metadata";
import SettingsClient from "./SettingsClient";

export const metadata = createMetadata({
  title: "Configuración",
  description: "Configura los ajustes generales del sistema, notificaciones, seguridad GPS e integraciones de RutaSegura.",
  path: "/settings",
});

export default function SettingsPage() {
  return <SettingsClient />;
}
