import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RutaSegura - Panel de Administración",
    short_name: "RutaSegura",
    description: "Sistema de gestión de transporte particular de personas",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1677ff",
  };
}
