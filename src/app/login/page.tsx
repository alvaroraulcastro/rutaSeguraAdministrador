import { createMetadata } from "@/lib/metadata";
import LoginForm from "./LoginForm";

export const metadata = createMetadata({
  title: "Iniciar Sesión",
  description: "Accede al panel de administración de RutaSegura para gestionar transportistas, pasajeros y rutas.",
  path: "/login",
});

export default function LoginPage() {
  return <LoginForm />;
}
