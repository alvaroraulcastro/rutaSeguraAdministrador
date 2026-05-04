"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spin } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/MainLayout";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];
const ADMIN_ONLY_PATHS = ["/drivers", "/settings"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathnameFromHook = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const rawPathname =
    pathnameFromHook ?? (typeof window !== "undefined" ? window.location.pathname : null);

  const pathname =
    typeof rawPathname === "string"
      ? rawPathname.replace(/\/$/, "") || "/"
      : null;

  const isAuthPath = typeof pathname === "string" ? AUTH_PATHS.includes(pathname) : false;
  const isAdminOnlyPath =
    typeof pathname === "string" ? ADMIN_ONLY_PATHS.includes(pathname) : false;

  let redirectTo: string | null = null;
  if (typeof pathname === "string") {
    if (isAuthPath) redirectTo = user ? "/" : null;
    else if (!user) redirectTo = "/login";
    else if (user.rol !== "ADMIN" && isAdminOnlyPath) redirectTo = "/";
  }

  useEffect(() => {
    if (!redirectTo) return;
    router.replace(redirectTo);
  }, [redirectTo, router]);

  if (typeof pathname !== "string" || redirectTo) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
          gap: 16,
        }}
        role="status"
        aria-label="Cargando aplicación"
        aria-busy="true"
      >
        <Spin size="large" description="Cargando..." />
      </div>
    );
  }

  if (isAuthPath) return <>{children}</>;
  if (!user) return null;
  return <MainLayout>{children}</MainLayout>;
}
