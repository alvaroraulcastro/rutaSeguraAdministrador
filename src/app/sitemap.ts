import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ruta-segura-administrador.vercel.app";

  const routes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/profile",
    "/drivers",
    "/passengers",
    "/routes",
    "/notifications",
    "/reports",
    "/settings",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1.0 : 0.7,
  }));
}
