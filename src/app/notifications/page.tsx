"use client";

import React from "react";
import { Table, Card, Typography, Tag, Badge, Space } from "antd";
import { MessageOutlined, WhatsAppOutlined, BellOutlined } from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";

const { Title } = Typography;

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Pasajero",
    dataIndex: "passenger",
    key: "passenger",
  },
  {
    title: "Tipo",
    dataIndex: "type",
    key: "type",
    render: (type: string) => <Tag color="blue">{type}</Tag>,
  },
  {
    title: "Canal",
    dataIndex: "channel",
    key: "channel",
    render: (channel: string) => (
      <Space>
        {channel === "WhatsApp" ? <WhatsAppOutlined style={{ color: "#25D366" }} /> : 
         channel === "SMS" ? <MessageOutlined style={{ color: "#1677ff" }} /> : 
         <BellOutlined style={{ color: "#faad14" }} />}
        {channel}
      </Space>
    ),
  },
  {
    title: "Estado",
    key: "status",
    dataIndex: "status",
    render: (status: string) => (
      <Badge status={status === "Enviado" ? "success" : "processing"} text={status} />
    ),
  },
  {
    title: "Hora",
    dataIndex: "timestamp",
    key: "timestamp",
  },
];

const data = [
  {
    key: "1",
    id: "N-001",
    passenger: "Ana Gómez",
    type: "En camino (1 min)",
    channel: "WhatsApp",
    status: "Enviado",
    timestamp: "2026-03-17 08:32:15",
  },
  {
    key: "2",
    id: "N-002",
    passenger: "Luis Ramírez",
    type: "En puerta",
    channel: "SMS",
    status: "Enviado",
    timestamp: "2026-03-17 08:45:02",
  },
  {
    key: "3",
    id: "N-003",
    passenger: "Sofía Castro",
    type: "Llegada a destino",
    channel: "Push",
    status: "Procesando",
    timestamp: "2026-03-17 09:15:30",
  },
];

export default function NotificationsPage() {
  return (
    <MainLayout>
      <Title level={2}>Log de Notificaciones</Title>
      
      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </MainLayout>
  );
}
