"use client";

import React from "react";
import { Row, Col, Card, Statistic, Table, Typography, Progress } from "antd";
import {
  ArrowUpOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";

const { Title, Text } = Typography;

const columns = [
  {
    title: "Fecha",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Rutas Totales",
    dataIndex: "totalRoutes",
    key: "totalRoutes",
  },
  {
    title: "Completadas",
    dataIndex: "completed",
    key: "completed",
    render: (count: number) => <Tag color="green">{count}</Tag>,
  },
  {
    title: "Incidentes",
    dataIndex: "incidents",
    key: "incidents",
    render: (count: number) => (
      <Tag color={count > 0 ? "red" : "blue"}>{count}</Tag>
    ),
  },
  {
    title: "Puntualidad",
    dataIndex: "punctuality",
    key: "punctuality",
    render: (value: number) => (
      <Progress percent={value} size="small" />
    ),
  },
];

const data = [
  {
    key: "1",
    date: "2026-03-16",
    totalRoutes: 45,
    completed: 45,
    incidents: 0,
    punctuality: 98,
  },
  {
    key: "2",
    date: "2026-03-15",
    totalRoutes: 45,
    completed: 42,
    incidents: 3,
    punctuality: 92,
  },
  {
    key: "3",
    date: "2026-03-14",
    totalRoutes: 40,
    completed: 40,
    incidents: 1,
    punctuality: 95,
  },
];

export default function ReportsPage() {
  return (
    <MainLayout>
      <Title level={2}>Reportes Operativos</Title>
      
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Eficiencia de Rutas"
              value={96.5}
              precision={2}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Incidencias (Mensual)"
              value={4}
              valueStyle={{ color: "#cf1322" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Tiempo Promedio Viaje"
              value={28}
              prefix={<ClockCircleOutlined />}
              suffix="min"
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 32 }}>
        <Title level={4}>Historial Diario de Operación</Title>
        <Table columns={columns} dataSource={data} />
      </div>
    </MainLayout>
  );
}
