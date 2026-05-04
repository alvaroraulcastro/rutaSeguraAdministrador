import { createMetadata } from "@/lib/metadata";
import DashboardClient from "./DashboardClient";

export const metadata = createMetadata({
  title: "Dashboard",
  description: "Panel de control principal de RutaSegura. Visualiza rutas activas, pasajeros, notificaciones y métricas clave de operación.",
  path: "/",
});

export default function HomePage() {
  return <DashboardClient />;
}
