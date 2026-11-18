"use client";

import React from "react";
import { Spin, Typography } from "antd";

const { Text } = Typography;

export default function PageLoading({ label = "Cargando datos..." }: { label?: string }) {
  return (
    <div
      style={{
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spin size="large" />
      <Text type="secondary">{label}</Text>
    </div>
  );
}