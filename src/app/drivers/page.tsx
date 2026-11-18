import { createMetadata } from "@/lib/metadata";
import DriversClient from "./DriversClient";

export const metadata = createMetadata({
  title: "Transportistas",
  description: "Gestiona los transportistas, conductores y vehículos de tu flota. Visualiza estados, capacidades y asignaciones.",
  path: "/drivers",
});

export default function DriversPage() {
  return <DriversClient />;
}
