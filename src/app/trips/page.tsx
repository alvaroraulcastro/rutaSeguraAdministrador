import { createMetadata } from "@/lib/metadata";
import ViajesClient from "./ViajesClient";

export const metadata = createMetadata({
  title: "Viajes",
  description: "Monitoreo de viajes diarios, estados y última posición GPS reportada por transportistas.",
  path: "/trips",
});

export default function TripsPage() {
  return <ViajesClient />;
}