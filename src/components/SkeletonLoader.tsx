"use client";

import React from "react";
import { Skeleton, Space } from "antd";

interface SkeletonLoaderProps {
  rows?: number;
  avatar?: boolean;
  paragraph?: boolean;
  title?: boolean;
  active?: boolean;
  className?: string;
}

export default function SkeletonLoader({
  rows = 4,
  avatar = false,
  paragraph = true,
  title = true,
  active = true,
  className = "",
}: SkeletonLoaderProps) {
  return (
    <div className={className} role="status" aria-label="Cargando contenido">
      <Skeleton
        active={active}
        avatar={avatar}
        title={title}
        paragraph={paragraph ? { rows } : false}
      />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }} role="status" aria-label="Cargando tabla">
      <Skeleton.Input active style={{ width: 300, height: 32 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} active title={false} paragraph={{ rows: 1, width: "100%" }} />
      ))}
    </Space>
  );
}

export function CardSkeleton() {
  return (
    <div role="status" aria-label="Cargando tarjeta">
      <Skeleton active avatar={false} title paragraph={{ rows: 3 }} />
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 16,
      }}
      className="stats-skeleton-grid"
      role="status"
      aria-label="Cargando estadísticas"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton.Button key={i} active block style={{ height: 100 }} />
      ))}
    </div>
  );
}
