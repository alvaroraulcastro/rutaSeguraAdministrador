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
  MailOutlined,
  CheckCircleOutlined,
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
  { key: "1", id: "N-001", passenger: "Ana Gómez", type: "En camino (1 min)", channel: "Email", status: "Enviado", timestamp: "2026-03-17 08:32:15", destinatario: "contacto1@example.com" },
  { key: "2", id: "N-002", passenger: "Luis Ramírez", type: "En puerta", channel: "Email", status: "Enviado", timestamp: "2026-03-17 08:45:02", destinatario: "tutor@example.com" },
  { key: "3", id: "N-003", passenger: "Sofía Castro", type: "Llegada a destino", channel: "Email", status: "Procesando", timestamp: "2026-03-17 09:15:30", destinatario: "contacto1@example.com" },
  { key: "4", id: "N-004", passenger: "Martín Fernández", type: "En camino (1 min)", channel: "Email", status: "Enviado", timestamp: "2026-03-17 09:22:10", destinatario: "madre@example.com" },
  { key: "5", id: "N-005", passenger: "Valentina Muñoz", type: "En puerta", channel: "Email", status: "Enviado", timestamp: "2026-03-17 09:35:00", destinatario: "contacto2@example.com" },
  { key: "6", id: "N-006", passenger: "Ana Gómez", type: "Llegada a destino", channel: "Email", status: "Fallido", timestamp: "2026-03-17 10:01:45", destinatario: "tutor@example.com" },
];

const channelIcon = () => {
  return <MailOutlined style={{ color: "#1677ff" }} />;
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
        <Space direction="vertical" size={0}>
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
          {channelIcon()}
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
    Email: MOCK_NOTIFICATIONS.filter((n) => n.channel === "Email").length,
  };
  const enviados = MOCK_NOTIFICATIONS.filter((n) => n.status === "Enviado").length;

  return (
    <>
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
              title="Email"
              value={byChannel.Email}
              prefix={<MailOutlined style={{ color: "#1677ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Entregas en cola"
              value={MOCK_NOTIFICATIONS.filter((n) => n.status === "Procesando").length}
              prefix={<MailOutlined />}
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
                { value: "Email", label: "Email" },
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
    </>
  );
}
