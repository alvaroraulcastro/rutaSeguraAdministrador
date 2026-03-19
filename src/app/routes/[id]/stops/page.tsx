"use client";

import GestionarParadas from "@/components/routes/GestionarParadas";
import { useParams } from "next/navigation";

export default function StopsRoutePage() {
  const params = useParams();
  const { id } = params;

  if (!id || typeof id !== "string") {
    return <div>ID de ruta no válido</div>;
  }

  return <GestionarParadas rutaId={id} />;
}
