"use client";

import React from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1677ff 0%, #4096ff 50%, #69b1ff 100%)",
        padding: 24,
      }}
      role="main"
      aria-label="Autenticación"
    >
      <div style={{ width: "100%", maxWidth: 420 }} className="animate-slide-up">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 28,
              fontWeight: "bold",
              marginBottom: 16,
            }}
            aria-hidden="true"
          >
            RS
          </div>
          <Title level={2} style={{ color: "#fff", margin: 0 }}>
            RutaSegura
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
            Panel de Administración
          </Text>
        </div>
        <Card
          title={title}
          styles={{ header: { textAlign: "center", fontSize: 18 } }}
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
        >
          {subtitle && (
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              {subtitle}
            </Text>
          )}
          {children}
        </Card>
      </div>
    </div>
  );
}
