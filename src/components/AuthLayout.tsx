"use client";

import React from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div
      className="auth-shell"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 10% 0%, rgba(255,255,255,0.12), transparent), linear-gradient(145deg, #0f172a 0%, #1565e8 45%, #4096ff 100%)",
      }}
      role="main"
      aria-label="Autenticación"
    >
      <div style={{ width: "100%", maxWidth: 440 }} className="animate-slide-up">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 68,
              borderRadius: 18,
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "#fff",
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 14,
            }}
            aria-hidden="true"
          >
            RS
          </div>
          <h2
            style={{
              color: "#fff",
              margin: 0,
              fontWeight: 600,
              fontSize: "1.875rem",
              lineHeight: 1.35,
            }}
          >
            RutaSegura
          </h2>
          <Text style={{ color: "rgba(255,255,255,0.88)", fontSize: 14 }}>
            Panel de administración de transporte
          </Text>
        </div>
        <Card
          title={<span style={{ fontWeight: 600 }}>{title}</span>}
          styles={{
            header: { textAlign: "center", borderBottom: "1px solid #eef2f7" },
            body: { paddingTop: 20 },
          }}
          style={{
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
            border: "1px solid rgba(255,255,255,0.35)",
          }}
        >
          {subtitle && (
            <Text type="secondary" style={{ display: "block", marginBottom: 16, textAlign: "center" }}>
              {subtitle}
            </Text>
          )}
          {children}
        </Card>
      </div>
    </div>
  );
}