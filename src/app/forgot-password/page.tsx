import { createMetadata } from "@/lib/metadata";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata = createMetadata({
  title: "Recuperar Contraseña",
  description: "Recupera el acceso a tu cuenta de RutaSegura. Te enviaremos un enlace para restablecer tu contraseña.",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
