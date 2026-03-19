"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Tag,
  Avatar,
  Input,
  Row,
  Col,
  Statistic,
  Select,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CarOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;

const MOCK_DRIVERS = [
  {
    key: "1",
    name: "Juan Pérez",
    email: "juan.perez@rutasegura.cl",
    phone: "+56 9 1234 5678",
    vehicle: "Mercedes-Benz Sprinter",
    plate: "ABCD-12",
    capacity: 15,
    status: "En ruta",
    rut: "12.345.678-9",
  },
  {
    key: "2",
    name: "María López",
    email: "maria.lopez@rutasegura.cl",
    phone: "+56 9 8765 4321",
    vehicle: "Hyundai H1",
    plate: "XYZ-987",
    capacity: 8,
    status: "Disponible",
    rut: "98.765.432-1",
  },
  {
    key: "3",
    name: "Carlos Soto",
    email: "carlos.soto@rutasegura.cl",
    phone: "+56 9 5555 1234",
    vehicle: "Toyota Hiace",
    plate: "FGHL-45",
    capacity: 12,
    status: "En ruta",
    rut: "11.222.333-4",
  },
  {
    key: "4",
    name: "Patricia Rojas",
    email: "patricia.rojas@rutasegura.cl",
    phone: "+56 9 4444 5678",
    vehicle: "Nissan Urvan",
    plate: "JKLM-90",
    capacity: 10,
    status: "Disponible",
    rut: "15.666.777-8",
  },
  {
    key: "5",
    name: "Roberto Díaz",
    email: "roberto.diaz@rutasegura.cl",
    phone: "+56 9 3333 9999",
    vehicle: "Mercedes-Benz Vito",
    plate: "PQRS-33",
    capacity: 6,
    status: "Fuera de servicio",
    rut: "18.999.000-1",
  },
];

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const columns = [
    {
      title: "Transportista",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: (typeof MOCK_DRIVERS)[0]) => (
        <Space orientation="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1677ff" }} />
            <div>
              <Text strong>{text}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                <MailOutlined /> {record.email}
              </Text>
            </div>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <PhoneOutlined /> {record.phone}
          </Text>
        </Space>
      ),
    },
    {
      title: "Vehículo",
      key: "vehicle",
      render: (_: unknown, record: (typeof MOCK_DRIVERS)[0]) => (
        <Space orientation="vertical" size={0}>
          <Text>{record.vehicle}</Text>
          <Tag color="gold">{record.plate}</Tag>
        </Space>
      ),
    },
    {
      title: "Capacidad",
      dataIndex: "capacity",
      key: "capacity",
      width: 90,
      render: (n: number) => (
        <Space>
          <CarOutlined />
          <Text>{n} pax</Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => {
        const config: Record<string, { color: string }> = {
          Disponible: { color: "green" },
          "En ruta": { color: "blue" },
          "Fuera de servicio": { color: "red" },
        };
        return <Tag color={config[status]?.color ?? "default"}>{status}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "action",
      width: 120,
      render: () => (
        <Space>
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

  const filtered = MOCK_DRIVERS.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const enRuta = MOCK_DRIVERS.filter((d) => d.status === "En ruta").length;
  const disponibles = MOCK_DRIVERS.filter((d) => d.status === "Disponible").length;

  return (
    <MainLayout>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          Transportistas
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Nuevo Transportista
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Transportistas"
              value={MOCK_DRIVERS.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="En ruta" value={enRuta} prefix={<CarOutlined />} styles={{ content: { color: "#1677ff" } }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Disponibles" value={disponibles} styles={{ content: { color: "#52c41a" } }} />
          </Card>
        </Col>
      </Row>

      <Card
        title="Listado de transportistas"
        extra={
          <Space wrap>
            <Input
              placeholder="Buscar por nombre o patente"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 160 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "Disponible", label: "Disponible" },
                { value: "En ruta", label: "En ruta" },
                { value: "Fuera de servicio", label: "Fuera de servicio" },
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
    </MainLayout>
  );
}
