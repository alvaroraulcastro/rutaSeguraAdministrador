import type { ThemeConfig } from "antd";

/** Tokens de marca RutaSegura (confianza + movilidad). */
export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1565e8",
    colorInfo: "#1565e8",
    colorSuccess: "#12b76a",
    colorWarning: "#f79009",
    colorError: "#f04438",
    borderRadius: 10,
    borderRadiusLG: 14,
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    colorBgLayout: "#f4f6fb",
    colorBgContainer: "#ffffff",
    controlHeight: 40,
    controlHeightLG: 44,
  },
  components: {
    Layout: {
      siderBg: "#0f172a",
      triggerBg: "#1e293b",
    },
    Menu: {
      darkItemBg: "#0f172a",
      darkSubMenuItemBg: "#0f172a",
    },
    Card: {
      paddingLG: 20,
    },
    Table: {
      headerBg: "#f8fafc",
      rowHoverBg: "#f1f5f9",
    },
    Button: {
      primaryShadow: "0 2px 0 rgba(21, 101, 232, 0.15)",
    },
  },
};