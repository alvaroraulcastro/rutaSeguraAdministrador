"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "antd";

const { Text } = Typography;

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(<Link href="/">Dashboard</Link>, "/", <PieChartOutlined />),
  getItem(<Link href="/profile">Mi Perfil</Link>, "/profile", <UserOutlined />),
  getItem(<Link href="/drivers">Transportistas</Link>, "/drivers", <CarOutlined />),
  getItem(<Link href="/passengers">Pasajeros</Link>, "/passengers", <TeamOutlined />),
  getItem(<Link href="/routes">Rutas</Link>, "/routes", <EnvironmentOutlined />),
  getItem(<Link href="/notifications">Notificaciones</Link>, "/notifications", <BellOutlined />),
  getItem(<Link href="/reports">Reportes</Link>, "/reports", <FileOutlined />),
  getItem(<Link href="/settings">Configuración</Link>, "/settings", <SettingOutlined />),
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/profile": "Mi Perfil",
  "/drivers": "Transportistas",
  "/passengers": "Pasajeros",
  "/routes": "Rutas",
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
  const [notifCount, setNotifCount] = useState(0);
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const isAdmin = user?.rol === "ADMIN";
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Fetch notification count in real-time (polling cada 30s)
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
        // Silencioso: no romper la UI si falla el conteo
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user?.apiKey]);

  const filteredItems = items.filter((item) => {
    if (!item) return false;
    const key = typeof item === "object" && item !== null && "key" in item ? item.key : null;
    if (!isAdmin && (key === "/drivers" || key === "/settings")) {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebarContent = (
    <>
      <div
        style={{
          height: 48,
          margin: 16,
          background: "rgba(255, 255, 255, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          borderRadius: borderRadiusLG,
          fontSize: collapsed && !mobileOpen ? 14 : 16,
          transition: "all 0.2s",
        }}
        aria-label="RutaSegura Logo"
      >
        {collapsed && !mobileOpen ? "RS" : "RutaSegura"}
      </div>
      <Menu
        theme="dark"
        selectedKeys={[pathname]}
        mode="inline"
        items={filteredItems}
        onClick={() => setMobileOpen(false)}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sider */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth={80}
        style={{
          display: isMobile ? "none" : "flex",
          position: "fixed",
          height: "100vh",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
        }}
        trigger={null}
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileOpen(false)}
        open={mobileOpen}
        styles={{ body: { padding: 0, background: "#001529" }, wrapper: { width: 240 } }}
      >
        <div style={{ height: "100vh" }}>{sidebarContent}</div>
      </Drawer>

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 40,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <Space>
            {isMobile && (
              <Button
                type="text"
                icon={mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              />
            )}
            <Breadcrumb
              items={[
                { title: "Admin" },
                { title: pageTitles[pathname] || "Dashboard" },
              ]}
            />
          </Space>
          <Space size="middle">
            <Badge count={notifCount} size="small" overflowCount={99}>
              <Tooltip title="Notificaciones">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  aria-label="Notificaciones"
                  onClick={() => router.push("/notifications")}
                />
              </Tooltip>
            </Badge>
            <Space size="small" className="hidden sm:inline-flex">
              <Avatar icon={<UserOutlined />} size="small" />
              <span className="text-sm font-medium">{user?.nombre ?? "Usuario"}</span>
            </Space>
            <Tooltip title="Cerrar sesión">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                aria-label="Cerrar sesión"
              />
            </Tooltip>
          </Space>
        </Header>
        <main>
          <Content style={{ margin: "16px" }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
              className="animate-fade-in"
            >
              {children}
            </div>
          </Content>
        </main>
        <Footer style={{ textAlign: "center", padding: "16px" }}>
          <Text type="secondary" className="text-xs">
            RutaSegura ©{new Date().getFullYear()} — Panel de Administración de Transporte
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
