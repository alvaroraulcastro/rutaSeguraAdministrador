"use client";

import React from "react";
import { Empty, Button, Typography } from "antd";
import type { ReactNode } from "react";

const { Text } = Typography;

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export default function EmptyState({
  title = "No hay datos",
  description = "Aún no hay registros para mostrar.",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`py-12 ${className}`} role="status" aria-label={title}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="text-center">
            <Text strong className="block text-base mb-1">
              {title}
            </Text>
            <Text type="secondary" className="block text-sm">
              {description}
            </Text>
            {action && (
              <Button
                type="primary"
                className="mt-4"
                icon={action.icon}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
