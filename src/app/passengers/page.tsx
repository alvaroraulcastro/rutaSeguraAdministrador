"use client";

import React from "react";
import { Table, Button, Space, Card, Typography, Tag, Avatar } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";

const { Title } = Typography;

const columns = [
  {
    title: "Pasajero",
    dataIndex: "name",
    key: "name",
    render: (text: string) => (
      <Space>
        <Avatar size="small" icon={<UserOutlined />} />
        {text}
      </Space>
    ),
  },
  {
    title: "Dirección",
    dataIndex: "address",
    key: "address",
  },
  {
    title: "Destino",
    dataIndex: "destination",
    key: "destination",
  },
  {
    title: "Ruta Asignada",
    dataIndex: "route",
    key: "route",
    render: (text: string) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: "Contacto",
    dataIndex: "contact",
    key: "contact",
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
    name: "Ana Gómez",
    address: "Los Olmos 456, Depto 201",
    destination: "Colegio Saint George",
    route: "Ruta 101",
    contact: "+56 9 1234 5678",
  },
  {
    key: "2",
    name: "Luis Ramírez",
    address: "Av. Las Condes 1234",
    destination: "Edificio Costanera",
    route: "Ruta 102",
    contact: "+56 9 8765 4321",
  },
];

export default function PassengersPage() {
  return (
    <MainLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Pasajeros</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Nuevo Pasajero
        </Button>
      </div>
      
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </MainLayout>
  );
}
