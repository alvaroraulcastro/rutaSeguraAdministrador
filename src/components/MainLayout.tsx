"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PieChartOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  UserOutlined,
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
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Obtener el nombre de la página actual para el breadcrumb
  const getPageName = () => {
    const item = items.find((i) => i?.key === pathname);
    if (!item) return "Dashboard";
    // Extraer el texto del label que es un Link
    const label = item.label as React.ReactElement;
    return label.props.children;
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
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Admin</Breadcrumb.Item>
            <Breadcrumb.Item>{getPageName()}</Breadcrumb.Item>
          </Breadcrumb>
          <Space size="large">
            <Badge count={5}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <span>Administrador</span>
            </Space>
            <Button type="text" icon={<LogoutOutlined />}>
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
