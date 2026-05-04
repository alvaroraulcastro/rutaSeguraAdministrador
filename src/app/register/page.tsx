import { createMetadata } from "@/lib/metadata";
import RegisterForm from "./RegisterForm";

export const metadata = createMetadata({
  title: "Crear Cuenta",
  description: "Regístrate en el panel de administración de RutaSegura y comienza a gestionar tu flota de transporte.",
  path: "/register",
});

export default function RegisterPage() {
  return <RegisterForm />;
}
