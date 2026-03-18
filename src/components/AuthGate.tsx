"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spin } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/MainLayout";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthPath = AUTH_PATHS.includes(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthPath) {
      if (user) router.replace("/");
    } else {
      if (!user) router.replace("/login");
    }
  }, [user, isLoading, isAuthPath, router]);

  if (isLoading) {
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
        <Spin size="large" tip="Cargando..." />
      </div>
    );
  }

  if (isAuthPath) return <>{children}</>;
  if (!user) return null;
  return <MainLayout>{children}</MainLayout>;
}
