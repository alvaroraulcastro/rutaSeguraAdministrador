import { createMetadata } from "@/lib/metadata";
import ProfileClient from "@/components/ProfileClient";

export const metadata = createMetadata({
  title: "Mi Perfil",
  description: "Gestiona tu información personal, foto de perfil y contraseña de acceso a RutaSegura.",
  path: "/profile",
});

export default function ProfilePage() {
  return <ProfileClient />;
}
