import { createMetadata } from "@/lib/metadata";
import PasajerosClient from "@/components/passengers/PasajerosClient";

export const metadata = createMetadata({
  title: "Pasajeros",
  description: "Administra los pasajeros, sus domicilios, destinos y contactos de notificación del sistema RutaSegura.",
  path: "/passengers",
});

export default function PassengersPage() {
  return <PasajerosClient />;
}
