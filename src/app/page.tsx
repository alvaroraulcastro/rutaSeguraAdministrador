"use client";

import React from "react";
import { Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";
import {
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  BellOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";

const { Title } = Typography;

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Transportista",
    dataIndex: "driver",
    key: "driver",
  },
  {
    title: "Ruta",
    dataIndex: "route",
    key: "route",
  },
  {
    title: "Estado",
    key: "status",
    dataIndex: "status",
    render: (status: string) => (
      <Tag color={status === "En curso" ? "blue" : "green"}>{status}</Tag>
    ),
  },
  {
    title: "Última parada",
    dataIndex: "lastStop",
    key: "lastStop",
  },
];

const data = [
  {
    key: "1",
    id: "R-101",
    driver: "Juan Pérez",
    route: "Ruta Mañana - Providencia",
    status: "En curso",
    lastStop: "Colegio Saint George",
  },
  {
    key: "2",
    id: "R-102",
    driver: "María López",
    route: "Ruta Mañana - Las Condes",
    status: "Completada",
    lastStop: "Edificio Costanera",
  },
  {
    key: "3",
    id: "R-103",
    driver: "Pedro Sánchez",
    route: "Ruta Tarde - Vitacura",
    status: "En curso",
    lastStop: "Av. Kennedy 123",
  },
];

export default function Home() {
  return (
    <MainLayout>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Rutas Activas"
              value={12}
              prefix={<CarOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Pasajeros Totales"
              value={156}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Notificaciones Hoy"
              value={842}
              prefix={<BellOutlined />}
              suffix={<ArrowUpOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Cumplimiento"
              value={98.5}
              precision={1}
              prefix={<EnvironmentOutlined />}
              suffix="%"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Title level={4}>Estado de Rutas en Tiempo Real</Title>
        <Table columns={columns} dataSource={data} />
      </div>
    </MainLayout>
  );
}
