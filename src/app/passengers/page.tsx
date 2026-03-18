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
  HomeOutlined,
  AimOutlined,
  PhoneOutlined,
  TeamOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;

const MOCK_PASSENGERS = [
  {
    key: "1",
    name: "Ana Gómez",
    address: "Los Olmos 456, Depto 201, Providencia",
    destination: "Colegio Saint George",
    route: "Ruta 101 - Providencia",
    contact: "+56 9 1234 5678",
    tipoViaje: "Ida y vuelta",
    contactosNotif: 2,
  },
  {
    key: "2",
    name: "Luis Ramírez",
    address: "Av. Las Condes 1234, Las Condes",
    destination: "Edificio Costanera Center",
    route: "Ruta 102 - Las Condes",
    contact: "+56 9 8765 4321",
    tipoViaje: "Solo ida",
    contactosNotif: 1,
  },
  {
    key: "3",
    name: "Sofía Castro",
    address: "Av. Kennedy 7890, Vitacura",
    destination: "Colegio Nido de Águilas",
    route: "Ruta 101 - Providencia",
    contact: "+56 9 5555 1111",
    tipoViaje: "Ida y vuelta",
    contactosNotif: 3,
  },
  {
    key: "4",
    name: "Martín Fernández",
    address: "El Bosque Norte 0123, Las Condes",
    destination: "Universidad Católica",
    route: "Ruta 103 - Mañana",
    contact: "+56 9 4444 2222",
    tipoViaje: "Solo ida",
    contactosNotif: 1,
  },
  {
    key: "5",
    name: "Valentina Muñoz",
    address: "Providencia 2345, Depto 501",
    destination: "Clínica Alemana",
    route: "Ruta 102 - Las Condes",
    contact: "+56 9 3333 9999",
    tipoViaje: "Ida y vuelta",
    contactosNotif: 2,
  },
];

export default function PassengersPage() {
  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState<string | null>(null);

  const columns = [
    {
      title: "Pasajero",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: (typeof MOCK_PASSENGERS)[0]) => (
        <Space orientation="vertical" size={0}>
          <Space>
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#52c41a" }} />
            <Text strong>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <PhoneOutlined /> {record.contact}
          </Text>
        </Space>
      ),
    },
    {
      title: "Domicilio",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
      render: (t: string) => (
        <Space>
          <HomeOutlined />
          <Text>{t}</Text>
        </Space>
      ),
    },
    {
      title: "Destino",
      dataIndex: "destination",
      key: "destination",
      render: (t: string) => (
        <Space>
          <AimOutlined />
          <Text>{t}</Text>
        </Space>
      ),
    },
    {
      title: "Ruta",
      dataIndex: "route",
      key: "route",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tipo viaje",
      dataIndex: "tipoViaje",
      key: "tipoViaje",
      width: 120,
      render: (t: string) => (
        <Tag color={t === "Ida y vuelta" ? "purple" : "cyan"}>{t}</Tag>
      ),
    },
    {
      title: "Contactos alerta",
      dataIndex: "contactosNotif",
      key: "contactosNotif",
      width: 100,
      render: (n: number) => (
        <Space>
          <TeamOutlined />
          <Text>{n}</Text>
        </Space>
      ),
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

  const routes = Array.from(new Set(MOCK_PASSENGERS.map((p) => p.route)));
  const filtered = MOCK_PASSENGERS.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.address.toLowerCase().includes(search.toLowerCase());
    const matchRoute = !routeFilter || d.route === routeFilter;
    return matchSearch && matchRoute;
  });

  return (
    <>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          Pasajeros
        </Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Nuevo Pasajero
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Total Pasajeros" value={MOCK_PASSENGERS.length} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Con ida y vuelta"
              value={MOCK_PASSENGERS.filter((p) => p.tipoViaje === "Ida y vuelta").length}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="Rutas con pasajeros" value={routes.length} prefix={<AimOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card
        title="Listado de pasajeros"
        extra={
          <Space wrap>
            <Input
              placeholder="Buscar por nombre o dirección"
              prefix={<UserOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />
            <Select
              placeholder="Filtrar por ruta"
              allowClear
              style={{ width: 220 }}
              value={routeFilter}
              onChange={setRouteFilter}
              options={routes.map((r) => ({ value: r, label: r }))}
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
