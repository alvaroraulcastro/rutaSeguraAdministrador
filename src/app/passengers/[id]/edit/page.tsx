"use client";

import EditarPasajeroForm from "@/components/passengers/EditarPasajeroForm";
import { useParams } from "next/navigation";

export default function EditPassengerPage() {
  const params = useParams();
  const { id } = params;

  if (!id || typeof id !== "string") {
    return <div>ID de pasajero no válido</div>;
  }

  return <EditarPasajeroForm pasajeroId={id} />;
}
