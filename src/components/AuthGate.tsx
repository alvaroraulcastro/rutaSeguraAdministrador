"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spin, Typography } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/MainLayout";

const { Text } = Typography;

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];
const ADMIN_ONLY_PATHS = ["/drivers", "/settings"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isAuthPath = AUTH_PATHS.includes(pathname);
  const [minLoadDone, setMinLoadDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadDone(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || !minLoadDone) return;
    if (isAuthPath) {
      if (user) router.replace("/");
    } else {
      if (!user) {
        router.replace("/login");
      } else if (user.rol !== "ADMIN" && ADMIN_ONLY_PATHS.includes(pathname)) {
        router.replace("/");
      }
    }
  }, [user, isLoading, isAuthPath, router, pathname, minLoadDone]);

  if (isLoading || !minLoadDone) {
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
        <Spin size="large" />
        <Text type="secondary">Cargando...</Text>
      </div>
    );
  }

  if (isAuthPath) return <>{children}</>;
  if (!user) return null;
  return <MainLayout>{children}</MainLayout>;
}
