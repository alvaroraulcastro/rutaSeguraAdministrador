"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Tag,
  Tooltip,
  Input,
  Row,
  Col,
  Statistic,
  Select,
  Progress,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  CarOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;

const MOCK_ROUTES = [
  {
    key: "1",
    name: "Ruta 101 - Providencia (Mañana)",
    driver: "Juan Pérez",
    passengers: 8,
    days: ["Lun", "Mar", "Mie", "Jue", "Vie"],
    type: "Ida y vuelta",
    horaInicio: "07:30",
    estado: "En curso",
    paradas: 9,
  },
  {
    key: "2",
    name: "Ruta 102 - Las Condes",
    driver: "María López",
    passengers: 5,
    days: ["Lun", "Mie", "Vie"],
    type: "Solo ida",
    horaInicio: "08:00",
    estado: "Completada",
    paradas: 6,
  },
  {
    key: "3",
    name: "Ruta 103 - Vitacura (Tarde)",
    driver: "Carlos Soto",
    passengers: 7,
    days: ["Lun", "Mar", "Mie", "Jue", "Vie"],
    type: "Ida y vuelta",
    horaInicio: "15:00",
    estado: "Programada",
    paradas: 8,
  },
  {
    key: "4",
    name: "Ruta 104 - La Reina",
    driver: "Patricia Rojas",
    passengers: 4,
    days: ["Mar", "Jue"],
    type: "Solo ida",
    horaInicio: "07:45",
    estado: "En curso",
    paradas: 5,
  },
];

export default function RoutesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const columns = [
    {
      title: "Nombre Ruta",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: (typeof MOCK_ROUTES)[0]) => (
        <Space orientation="vertical" size={0}>
          <Space>
            <EnvironmentOutlined style={{ color: "#1677ff" }} />
            <Text strong>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CalendarOutlined /> Inicio: {record.horaInicio} · {record.paradas} paradas
          </Text>
        </Space>
      ),
    },
    {
      title: "Transportista",
      dataIndex: "driver",
      key: "driver",
      render: (text: string) => (
        <Tag color="orange" icon={<CarOutlined />}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Pasajeros",
      dataIndex: "passengers",
      key: "passengers",
      width: 100,
      render: (n: number) => (
        <Space>
          <TeamOutlined />
          <Text>{n}</Text>
        </Space>
      ),
    },
    {
      title: "Días",
      dataIndex: "days",
      key: "days",
      render: (days: string[]) => (
        <Space size={[0, 4]} wrap>
          {days.map((d) => (
            <Tag key={d}>{d}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <Tag color={type === "Ida y vuelta" ? "purple" : "cyan"}>{type}</Tag>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 120,
      render: (estado: string) => {
        const colors: Record<string, string> = {
          "En curso": "blue",
          Completada: "green",
          Programada: "default",
        };
        return <Tag color={colors[estado] ?? "default"}>{estado}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "action",
      width: 140,
      render: () => (
        <Space>
          <Tooltip title="Ver en mapa">
            <Button icon={<EyeOutlined />} type="text" size="small" />
          </Tooltip>
          <Tooltip title="Editar">
            <Button icon={<EditOutlined />} type="text" size="small" />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button icon={<DeleteOutlined />} type="text" danger size="small" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filtered = MOCK_ROUTES.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.driver.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || r.type === typeFilter;
    const matchStatus = !statusFilter || r.estado === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const enCurso = MOCK_ROUTES.filter((r) => r.estado === "En curso").length;
  const totalPasajeros = MOCK_ROUTES.reduce((s, r) => s + r.passengers, 0);

  return (
    <MainLayout>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          Rutas
        </Title>
        <Link href="/routes/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Nueva Ruta
          </Button>
        </Link>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Rutas" value={MOCK_ROUTES.length} prefix={<EnvironmentOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Rutas en curso hoy" value={enCurso} prefix={<CarOutlined />} styles={{ content: { color: "#1677ff" } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Pasajeros en rutas" value={totalPasajeros} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card
        title="Listado de rutas"
        extra={
          <Space wrap>
            <Input
              placeholder="Buscar por nombre o transportista"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />
            <Select
              placeholder="Tipo"
              allowClear
              style={{ width: 140 }}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "Ida y vuelta", label: "Ida y vuelta" },
                { value: "Solo ida", label: "Solo ida" },
              ]}
            />
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 140 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "En curso", label: "En curso" },
                { value: "Completada", label: "Completada" },
                { value: "Programada", label: "Programada" },
              ]}
            />
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
