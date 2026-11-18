"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";
import {
  PieChartOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileOutlined,
  ScheduleOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Breadcrumb,
  Layout,
  Menu,
  theme,
  Button,
  Space,
  Avatar,
  Badge,
  Drawer,
  Tooltip,
  Typography,
  Dropdown,
} from "antd";

const { Text } = Typography;
const { Header, Content, Footer, Sider } = Layout;

const ADMIN_ONLY_KEYS = new Set(["/drivers", "/settings"]);

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/profile": "Mi Perfil",
  "/drivers": "Transportistas",
  "/passengers": "Pasajeros",
  "/routes": "Rutas",
  "/trips": "Viajes",
  "/notifications": "Notificaciones",
  "/reports": "Reportes",
  "/settings": "Configuración",
};

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const isAdmin = user?.rol === "ADMIN";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      if (!user?.apiKey) return;
      try {
        const res = await fetch(getApiUrl("/api/v1/notificaciones/count"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifCount(data.total ?? 0);
        }
      } catch {
        /* ignore */
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user?.apiKey]);

  const menuItems: MenuProps["items"] = useMemo(() => {
    const all: MenuProps["items"] = [
      { type: "group", label: "Resumen", children: [{ key: "/", icon: <PieChartOutlined />, label: "Dashboard" }] },
      {
        type: "group",
        label: "Operación",
        children: [
          { key: "/passengers", icon: <TeamOutlined />, label: "Pasajeros" },
          { key: "/routes", icon: <EnvironmentOutlined />, label: "Rutas" },
          { key: "/trips", icon: <ScheduleOutlined />, label: "Viajes" },
          { key: "/notifications", icon: <BellOutlined />, label: "Notificaciones" },
        ],
      },
      {
        type: "group",
        label: "Administración",
        children: [
          { key: "/drivers", icon: <CarOutlined />, label: "Transportistas" },
          { key: "/reports", icon: <FileOutlined />, label: "Reportes" },
          { key: "/settings", icon: <SettingOutlined />, label: "Configuración" },
        ],
      },
      { type: "group", label: "Cuenta", children: [{ key: "/profile", icon: <UserOutlined />, label: "Mi Perfil" }] },
    ];

    if (isAdmin) return all;

    return all
      .map((group) => {
        if (!group || typeof group !== "object" || !("children" in group) || !group.children) return group;
        const children = group.children.filter((item) => {
          if (!item || typeof item !== "object" || !("key" in item)) return true;
          return !ADMIN_ONLY_KEYS.has(String(item.key));
        });
        if (children.length === 0) return null;
        return { ...group, children };
      })
      .filter(Boolean) as MenuProps["items"];
  }, [isAdmin]);

  const selectedKey = useMemo(() => {
    if (pageTitles[pathname]) return pathname;
    const base = pathname.split("/").slice(0, 2).join("/") || "/";
    return pageTitles[base] ? base : pathname;
  }, [pathname]);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    router.push(String(key));
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const siderWidth = collapsed && !isMobile ? 80 : 240;

  const sidebarContent = (
    <>
      <div
        role="banner"
        aria-label="RutaSegura"
        style={{
          height: 52,
          margin: "12px 12px 8px",
          padding: collapsed && !isMobile ? 0 : "0 12px",
          background: "linear-gradient(135deg, rgba(21,101,232,0.35), rgba(255,255,255,0.08))",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          gap: 10,
          color: "white",
          borderRadius: borderRadiusLG,
          fontWeight: 600,
          fontSize: collapsed && !isMobile ? 14 : 15,
          letterSpacing: "-0.01em",
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(255,255,255,0.18)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-hidden
        >
          RS
        </span>
        {!(collapsed && !isMobile) && <span>RutaSegura</span>}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ background: "transparent", borderInlineEnd: "none" }}
      />
    </>
  );

  const userMenuItems: MenuProps["items"] = [
    { key: "profile", icon: <UserOutlined />, label: "Mi perfil", onClick: () => router.push("/profile") },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "Cerrar sesión", danger: true, onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          width={240}
          collapsed={collapsed}
          collapsedWidth={80}
          style={{
            position: "fixed",
            insetBlock: 0,
            insetInlineStart: 0,
            zIndex: 100,
            borderInlineEnd: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      <Drawer
        placement="left"
        closable
        title="Menú"
        onClose={() => setMobileOpen(false)}
        open={isMobile && mobileOpen}
        styles={{ body: { padding: 0, background: "#0f172a" }, header: { background: "#0f172a", color: "#fff" } }}
        width={280}
      >
        <div style={{ minHeight: "100%" }}>{sidebarContent}</div>
      </Drawer>

      <Layout style={{ marginInlineStart: isMobile ? 0 : siderWidth, transition: "margin 0.2s ease" }}>
        <Header
          style={{
            padding: "0 16px 0 20px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 90,
            borderBottom: "1px solid #e8edf5",
            height: 64,
          }}
        >
          <Space size="middle">
            <Button
              type="text"
              icon={
                isMobile ? (
                  <MenuOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() => (isMobile ? setMobileOpen(true) : setCollapsed((c) => !c))}
              aria-label={isMobile ? "Abrir menú" : collapsed ? "Expandir menú" : "Colapsar menú"}
            />
            <Breadcrumb
              items={[{ title: "Panel" }, { title: pageTitles[selectedKey] || "Inicio" }]}
            />
          </Space>
          <Space size="middle">
            <Badge count={notifCount} size="small" overflowCount={99} offset={[-2, 2]}>
              <Tooltip title="Ver notificaciones">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  aria-label="Notificaciones"
                  onClick={() => router.push("/notifications")}
                />
              </Tooltip>
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border-0 bg-transparent px-2 py-1 cursor-pointer hover:bg-slate-50"
                aria-label="Menú de usuario"
              >
                <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: "#1565e8" }} />
                <Text style={{ maxWidth: 140 }} ellipsis className="hidden sm:inline">
                  {user?.nombre ?? "Usuario"}
                </Text>
              </button>
            </Dropdown>
          </Space>
        </Header>
        <main>
          <Content style={{ padding: "16px 16px 24px", maxWidth: 1440, marginInline: "auto", width: "100%" }}>
            <div
              className="animate-fade-in content-panel"
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </div>
          </Content>
        </main>
        <Footer style={{ textAlign: "center", padding: "12px 16px 20px", background: "transparent" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            RutaSegura © {new Date().getFullYear()} — Administración de transporte
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;