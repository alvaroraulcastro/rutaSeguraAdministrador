"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme, Button, Space, Avatar, Badge } from "antd";

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

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const isAdmin = user?.rol === "ADMIN";

  // Filtrar items del menú según el rol
  const filteredItems = items.filter(item => {
    if (!item) return false;
    const key = typeof item === "object" && item !== null && "key" in item ? item.key : null;
    // Solo ADMIN puede ver Transportistas (/drivers) y Configuración (/settings)
    if (!isAdmin && (key === "/drivers" || key === "/settings")) {
      return false;
    }
    return true;
  });

  // Obtener el nombre de la página actual para el breadcrumb
  const getPageName = () => {
    const item = items.find((i) => i && "key" in i && i.key === pathname);
    if (!item || !("label" in item)) return "Dashboard";
    
    // Mapeo seguro de nombres de página para evitar hydration errors
    const pageNames: Record<string, string> = {
      "/": "Dashboard",
      "/profile": "Mi Perfil", 
      "/drivers": "Transportistas",
      "/passengers": "Pasajeros",
      "/routes": "Rutas",
      "/notifications": "Notificaciones",
      "/reports": "Reportes",
      "/settings": "Configuración"
    };
    
    return pageNames[pathname] || "Dashboard";
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            borderRadius: borderRadiusLG,
          }}
        >
          {collapsed ? "RS" : "RutaSegura"}
        </div>
        <Menu 
          theme="dark" 
          selectedKeys={[pathname]} 
          mode="inline" 
          items={filteredItems} 
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[
              { title: "Admin" },
              { title: getPageName() },
            ]}
          />
          <Space size="large">
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.nombre ?? "Administrador"}</span>
            </Space>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              Salir
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: "16px" }}>
          <div
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
        <Footer style={{ textAlign: "center" }}>
          RutaSegura ©{new Date().getFullYear()} - Panel de Administración de Transporte
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
