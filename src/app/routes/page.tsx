"use client";

import React from "react";
import { Table, Button, Space, Card, Typography, Tag, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";

const { Title } = Typography;

const columns = [
  {
    title: "Nombre Ruta",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Transportista",
    dataIndex: "driver",
    key: "driver",
    render: (text: string) => <Tag color="orange">{text}</Tag>,
  },
  {
    title: "Pasajeros",
    dataIndex: "passengers",
    key: "passengers",
    render: (count: number) => <Tag>{count}</Tag>,
  },
  {
    title: "Días",
    dataIndex: "days",
    key: "days",
    render: (days: string[]) => (
      <Space size={[0, 4]} wrap>
        {days.map((day) => (
          <Tag key={day}>{day}</Tag>
        ))}
      </Space>
    ),
  },
  {
    title: "Tipo",
    dataIndex: "type",
    key: "type",
    render: (type: string) => (
      <Tag color={type === "Ida/Vuelta" ? "purple" : "cyan"}>{type}</Tag>
    ),
  },
  {
    title: "Acciones",
    key: "action",
    render: () => (
      <Space size="middle">
        <Tooltip title="Ver en Mapa">
          <Button icon={<EyeOutlined />} type="text" />
        </Tooltip>
        <Button icon={<EditOutlined />} type="text" />
        <Button icon={<DeleteOutlined />} type="text" danger />
      </Space>
    ),
  },
];

const data = [
  {
    key: "1",
    name: "Ruta 101 - Providencia",
    driver: "Juan Pérez",
    passengers: 8,
    days: ["Lun", "Mar", "Mie", "Jue", "Vie"],
    type: "Ida/Vuelta",
  },
  {
    key: "2",
    name: "Ruta 102 - Las Condes",
    driver: "María López",
    passengers: 5,
    days: ["Lun", "Mie", "Vie"],
    type: "Solo Ida",
  },
];

export default function RoutesPage() {
  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Rutas</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Nueva Ruta
        </Button>
      </div>
      
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </MainLayout>
  );
}
