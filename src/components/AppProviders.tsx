"use client";

import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { appTheme } from "@/theme/appTheme";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider locale={esES} theme={appTheme}>
        <App
          message={{ maxCount: 3, duration: 4, top: 72 }}
          notification={{ placement: "topRight", duration: 5 }}
        >
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}