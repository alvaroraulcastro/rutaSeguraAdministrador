"use client";

import React from "react";
import { Table, Button, Space, Card, Typography, Tag, Avatar } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";

const { Title } = Typography;

const columns = [
  {
    title: "Transportista",
    dataIndex: "name",
    key: "name",
    render: (text: string) => (
      <Space>
        <Avatar icon={<UserOutlined />} />
        {text}
      </Space>
    ),
  },
  {
    title: "Vehículo",
    dataIndex: "vehicle",
    key: "vehicle",
  },
  {
    title: "Patente",
    dataIndex: "plate",
    key: "plate",
    render: (text: string) => <Tag color="gold">{text}</Tag>,
  },
  {
    title: "Capacidad",
    dataIndex: "capacity",
    key: "capacity",
  },
  {
    title: "Estado",
    key: "status",
    dataIndex: "status",
    render: (status: string) => (
      <Tag color={status === "Disponible" ? "green" : "orange"}>{status}</Tag>
    ),
  },
  {
    title: "Acciones",
    key: "action",
    render: () => (
      <Space size="middle">
        <Button icon={<EditOutlined />} type="text" />
        <Button icon={<DeleteOutlined />} type="text" danger />
      </Space>
    ),
  },
];

const data = [
  {
    key: "1",
    name: "Juan Pérez",
    vehicle: "Mercedes-Benz Sprinter",
    plate: "ABCD-12",
    capacity: 15,
    status: "En ruta",
  },
  {
    key: "2",
    name: "María López",
    vehicle: "Hyundai H1",
    plate: "XYZ-987",
    capacity: 8,
    status: "Disponible",
  },
];

export default function DriversPage() {
  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Transportistas</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Nuevo Transportista
        </Button>
      </div>
      
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </MainLayout>
  );
}
