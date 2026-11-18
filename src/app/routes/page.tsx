import { createMetadata } from "@/lib/metadata";
import RutasClient from "@/components/routes/RutasClient";

export const metadata = createMetadata({
  title: "Rutas",
  description: "Crea, visualiza y administra las rutas de transporte. Configura paradas, transportistas y tipos de recorrido.",
  path: "/routes",
});

export default function RoutesPage() {
  return <RutasClient />;
}
