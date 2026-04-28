"use client";

import React, { useMemo, useState } from "react";
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

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items: MenuItem[] = useMemo(() => {
    const base = [
      getItem(<Link href="/">Dashboard</Link>, "/", <PieChartOutlined />),
      getItem(<Link href="/passengers">Pasajeros</Link>, "/passengers", <TeamOutlined />),
      getItem(<Link href="/routes">Rutas</Link>, "/routes", <EnvironmentOutlined />),
      getItem(<Link href="/notifications">Notificaciones</Link>, "/notifications", <BellOutlined />),
      getItem(<Link href="/reports">Reportes</Link>, "/reports", <FileOutlined />),
    ];

    if (user?.rol === "ADMIN") {
      return [
        base[0],
        getItem(<Link href="/drivers">Transportistas</Link>, "/drivers", <CarOutlined />),
        ...base.slice(1),
        getItem(<Link href="/settings">Configuración</Link>, "/settings", <SettingOutlined />),
      ];
    }

    return base;
  }, [user?.rol]);

  // Obtener el nombre de la página actual para el breadcrumb
  const getPageName = () => {
    const item = items.find((i) => i && "key" in i && i.key === pathname);
    if (!item || !("label" in item)) return "Dashboard";
    const labelNode = item.label as unknown;
    if (React.isValidElement(labelNode)) {
      const children = (labelNode.props as { children?: unknown }).children;
      if (typeof children === "string") return children;
    }
    return "Dashboard";
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
          items={items} 
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
              { title: user?.rol === "ADMIN" ? "Administrador" : "Transportista" },
              { title: getPageName() },
            ]}
          />
          <Space size="large">
            <Badge count={0}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.nombre ?? "Usuario"}</span>
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
          RutaSegura ©{new Date().getFullYear()} - Panel {user?.rol === "ADMIN" ? "Administrador" : "Transportista"}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
