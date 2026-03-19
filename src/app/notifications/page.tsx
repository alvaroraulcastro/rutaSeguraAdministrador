"use client";

import React, { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Badge,
  Space,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Input,
} from "antd";
import {
  MessageOutlined,
  WhatsAppOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
const { Title, Text } = Typography;

type NotificationRecord = {
  key: string;
  id: string;
  passenger: string;
  type: string;
  channel: string;
  status: string;
  timestamp: string;
  destinatario?: string;
};

const MOCK_NOTIFICATIONS: NotificationRecord[] = [
  { key: "1", id: "N-001", passenger: "Ana Gómez", type: "En camino (1 min)", channel: "WhatsApp", status: "Enviado", timestamp: "2026-03-17 08:32:15", destinatario: "Contacto 1" },
  { key: "2", id: "N-002", passenger: "Luis Ramírez", type: "En puerta", channel: "SMS", status: "Enviado", timestamp: "2026-03-17 08:45:02", destinatario: "Tutor" },
  { key: "3", id: "N-003", passenger: "Sofía Castro", type: "Llegada a destino", channel: "Push", status: "Procesando", timestamp: "2026-03-17 09:15:30", destinatario: "Contacto 1" },
  { key: "4", id: "N-004", passenger: "Martín Fernández", type: "En camino (1 min)", channel: "WhatsApp", status: "Enviado", timestamp: "2026-03-17 09:22:10", destinatario: "Madre" },
  { key: "5", id: "N-005", passenger: "Valentina Muñoz", type: "En puerta", channel: "WhatsApp", status: "Enviado", timestamp: "2026-03-17 09:35:00", destinatario: "Contacto 2" },
  { key: "6", id: "N-006", passenger: "Ana Gómez", type: "Llegada a destino", channel: "SMS", status: "Fallido", timestamp: "2026-03-17 10:01:45", destinatario: "Tutor" },
];

const channelIcon = (channel: string) => {
  if (channel === "WhatsApp") return <WhatsAppOutlined style={{ color: "#25D366" }} />;
  if (channel === "SMS") return <MessageOutlined style={{ color: "#1677ff" }} />;
  return <BellOutlined style={{ color: "#faad14" }} />;
};

const statusConfig: Record<string, "success" | "processing" | "error" | "default"> = {
  Enviado: "success",
  Procesando: "processing",
  Fallido: "error",
};

export default function NotificationsPage() {
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const columns: ColumnsType<NotificationRecord> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 90,
    },
    {
      title: "Pasajero",
      dataIndex: "passenger",
      key: "passenger",
      render: (t, r) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{t}</Text>
          {r.destinatario && (
            <Text type="secondary" style={{ fontSize: 12 }}>→ {r.destinatario}</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Tipo de alerta",
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
          {channelIcon(channel)}
          <Text>{channel}</Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Badge status={statusConfig[status] ?? "default"} text={status} />
      ),
    },
    {
      title: "Fecha y hora",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 160,
    },
  ];

  const filtered = MOCK_NOTIFICATIONS.filter((n) => {
    const matchChannel = !channelFilter || n.channel === channelFilter;
    const matchStatus = !statusFilter || n.status === statusFilter;
    const matchSearch =
      !search ||
      n.passenger.toLowerCase().includes(search.toLowerCase()) ||
      n.id.toLowerCase().includes(search.toLowerCase());
    return matchChannel && matchStatus && matchSearch;
  });

  const byChannel = {
    WhatsApp: MOCK_NOTIFICATIONS.filter((n) => n.channel === "WhatsApp").length,
    SMS: MOCK_NOTIFICATIONS.filter((n) => n.channel === "SMS").length,
    Push: MOCK_NOTIFICATIONS.filter((n) => n.channel === "Push").length,
  };
  const enviados = MOCK_NOTIFICATIONS.filter((n) => n.status === "Enviado").length;

  return (
    <MainLayout>
      <Title level={2}>Log de Notificaciones</Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        Historial de alertas enviadas a pasajeros y contactos de emergencia.
      </Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Enviadas hoy"
              value={enviados}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="WhatsApp"
              value={byChannel.WhatsApp}
              prefix={<WhatsAppOutlined style={{ color: "#25D366" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="SMS / Push"
              value={byChannel.SMS + byChannel.Push}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Historial de notificaciones"
        extra={
          <Space wrap>
            <Input
              placeholder="Buscar por pasajero o ID"
              prefix={<UserOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              placeholder="Canal"
              allowClear
              style={{ width: 130 }}
              value={channelFilter}
              onChange={setChannelFilter}
              options={[
                { value: "WhatsApp", label: "WhatsApp" },
                { value: "SMS", label: "SMS" },
                { value: "Push", label: "Push" },
              ]}
            />
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 130 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "Enviado", label: "Enviado" },
                { value: "Procesando", label: "Procesando" },
                { value: "Fallido", label: "Fallido" },
              ]}
            />
            <DatePicker placeholder="Fecha" />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
        />
      </Card>
    </MainLayout>
  );
}
