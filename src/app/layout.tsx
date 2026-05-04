import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGate from "@/components/AuthGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: {
    default: "RutaSegura - Panel de Administración",
    template: "%s | RutaSegura",
  },
  description:
    "Sistema de gestión de transporte particular de personas. Administra transportistas, pasajeros, rutas y notificaciones desde un solo panel.",
  keywords: [
    "transporte",
    "gestión",
    "rutas",
    "pasajeros",
    "transportistas",
    "administración",
    "logística",
  ],
  authors: [{ name: "RutaSegura" }],
  creator: "RutaSegura",
  publisher: "RutaSegura",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://ruta-segura-administrador.vercel.app",
    siteName: "RutaSegura",
    title: "RutaSegura - Panel de Administración",
    description:
      "Sistema de gestión de transporte particular de personas. Administra transportistas, pasajeros, rutas y notificaciones desde un solo panel.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RutaSegura - Panel de Administración",
    description:
      "Sistema de gestión de transporte particular de personas. Administra transportistas, pasajeros, rutas y notificaciones desde un solo panel.",
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  category: "business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased">
        <AntdRegistry>
          <AuthProvider>
            <AuthGate>{children}</AuthGate>
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
