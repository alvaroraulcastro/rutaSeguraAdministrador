import type { Metadata } from "next";

interface PageMetaParams {
  title: string;
  description: string;
  path?: string;
}

export function createMetadata({ title, description, path }: PageMetaParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://ruta-segura-administrador.vercel.app";
  const canonical = path ? `${baseUrl}${path}` : baseUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical,
    },
  };
}
