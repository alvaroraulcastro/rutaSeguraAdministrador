"use client";

import EditarRutaForm from "@/components/routes/EditarRutaForm";
import { useParams } from "next/navigation";

export default function EditRoutePage() {
  const params = useParams();
  const { id } = params;

  if (!id || typeof id !== "string") {
    return <div>ID de ruta no válido</div>;
  }

  return <EditarRutaForm id={id} />;
}
