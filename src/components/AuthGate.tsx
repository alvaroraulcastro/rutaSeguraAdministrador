"use client";

import React, { useEffect, useMemo } from "react";
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

  const pathname =
    pathnameFromHook ?? (typeof window !== "undefined" ? window.location.pathname : null);

  const isAuthPath = typeof pathname === "string" ? AUTH_PATHS.includes(pathname) : false;
  const isAdminOnlyPath =
    typeof pathname === "string" ? ADMIN_ONLY_PATHS.includes(pathname) : false;

  const redirectTo = useMemo(() => {
    if (typeof pathname !== "string") return null;

    if (isAuthPath) return user ? "/" : null;
    if (!user) return "/login";
    if (user.rol !== "ADMIN" && isAdminOnlyPath) return "/";
    return null;
  }, [pathname, isAuthPath, isAdminOnlyPath, user]);

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
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f2f5",
        }}
      >
        <Spin size="large" description="Cargando..." />
      </div>
    );
  }

  if (isAuthPath) return <>{children}</>;
  if (!user) return null;
  return <MainLayout>{children}</MainLayout>;
}
