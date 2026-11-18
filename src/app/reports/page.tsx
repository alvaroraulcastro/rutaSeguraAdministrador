import { createMetadata } from "@/lib/metadata";
import ReportsClient from "./ReportsClient";

export const metadata = createMetadata({
  title: "Reportes",
  description: "Visualiza reportes operativos, eficiencia de rutas, incidencias y puntualidad del servicio de transporte.",
  path: "/reports",
});

export default function ReportsPage() {
  return <ReportsClient />;
}
