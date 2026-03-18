"use client";

import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Progress,
  Tag,
  Select,
  DatePicker,
  Button,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
    render: (value: number) => <Progress percent={value} size="small" style={{ margin: 0, minWidth: 100 }} />,
  },
];

const data = [
  { key: "1", date: "2026-03-16", totalRoutes: 45, completed: 45, incidents: 0, punctuality: 98 },
  { key: "2", date: "2026-03-15", totalRoutes: 45, completed: 42, incidents: 3, punctuality: 92 },
  { key: "3", date: "2026-03-14", totalRoutes: 40, completed: 40, incidents: 1, punctuality: 95 },
  { key: "4", date: "2026-03-13", totalRoutes: 42, completed: 41, incidents: 2, punctuality: 94 },
  { key: "5", date: "2026-03-12", totalRoutes: 38, completed: 38, incidents: 0, punctuality: 100 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState<string>("7");

  return (
    <>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Reportes Operativos
          </Title>
          <Text type="secondary">Resumen de eficiencia, puntualidad e incidencias.</Text>
        </div>
        <Space>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 140 }}
            options={[
              { value: "7", label: "Últimos 7 días" },
              { value: "30", label: "Últimos 30 días" },
              { value: "90", label: "Últimos 90 días" },
            ]}
          />
          <RangePicker />
          <Button icon={<FileExcelOutlined />}>Excel</Button>
          <Button icon={<FilePdfOutlined />}>PDF</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Eficiencia de Rutas"
              value={96.5}
              precision={2}
              styles={{ content: { color: "#3f8600" } }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Incidencias (Mes)"
              value={4}
              styles={{ content: { color: "#cf1322" } }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tiempo Promedio Viaje"
              value={28}
              prefix={<ClockCircleOutlined />}
              suffix="min"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Historial diario de operación" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showTotal: (t) => `Total: ${t}` }}
        />
      </Card>
    </>
  );
}
