"use client";

import React from "react";
import { Card, Statistic } from "antd";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  suffix?: ReactNode;
  precision?: number;
  accent?: string;
  icon?: ReactNode;
}

export default function StatCard({ title, value, suffix, precision, accent, icon }: StatCardProps) {
  return (
    <Card variant="borderless" className="stat-card" styles={{ body: { padding: 20 } }}>
      <Statistic
        title={title}
        value={value}
        suffix={suffix}
        precision={precision}
        prefix={icon}
        valueStyle={{
          fontSize: 28,
          fontWeight: 600,
          ...(accent ? { color: accent } : {}),
        }}
      />
    </Card>
  );
}