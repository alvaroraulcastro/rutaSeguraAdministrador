import { createMetadata } from "@/lib/metadata";
import NotificationsClient from "./NotificationsClient";

export const metadata = createMetadata({
  title: "Notificaciones",
  description: "Historial de notificaciones enviadas a pasajeros y contactos. Filtra por canal, estado y fecha.",
  path: "/notifications",
});

export default function NotificationsPage() {
  return <NotificationsClient />;
}
