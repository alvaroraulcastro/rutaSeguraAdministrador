"use client";

import React from "react";
import { Space, Typography } from "antd";

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
}

export default function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div
      className="page-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div style={{ flex: "1 1 240px", minWidth: 0 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 600, letterSpacing: "-0.02em" }}>
          {title}
        </Title>
        {description ? (
          <Text type="secondary" style={{ display: "block", marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>
            {description}
          </Text>
        ) : null}
      </div>
      {extra ? <Space wrap>{extra}</Space> : null}
    </div>
  );
}