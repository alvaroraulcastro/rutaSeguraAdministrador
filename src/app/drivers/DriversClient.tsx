"use client";

import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Tag, Avatar, Input, Row, Col, Select, Space, Alert } from "antd";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import PageLoading from "@/components/PageLoading";
import {
  UserOutlined,
  CarOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Text } = Typography;

interface TransportistaApi {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  patente: string | null;
  modelo: string | null;
  capacidad: number | null;
  rutasAsignadas: number;
  estadoOperativo: "En ruta" | "Disponible";
}

export default function DriversClient() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<TransportistaApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      if (!user?.apiKey) return;
      try {
        setLoading(true);
        const res = await fetch(getApiUrl("/api/v1/transportistas"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (!res.ok) throw new Error("Error al cargar transportistas");
        setDrivers(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [user?.apiKey]);

  const columns = [
    {
      title: "Transportista",
      dataIndex: "nombre",
      key: "nombre",
      render: (text: string, record: TransportistaApi) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Text strong>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.id.slice(0, 10)}…
          </Text>
        </Space>
      ),
    },
    {
      title: "Vehículo",
      key: "vehicle",
      render: (_: unknown, record: TransportistaApi) => (
        <Space direction="vertical" size={0}>
          <Space>
            <CarOutlined />
            <Text>{record.modelo ?? "Sin modelo"}</Text>
          </Space>
          {record.patente ? <Tag color="blue">{record.patente}</Tag> : <Text type="secondary">Sin patente</Text>}
        </Space>
      ),
    },
    {
      title: "Contacto",
      key: "contact",
      render: (_: unknown, record: TransportistaApi) => (
        <Space direction="vertical" size={0}>
          <Space>
            <PhoneOutlined style={{ fontSize: 12 }} />
            <Text style={{ fontSize: 12 }}>{record.telefono}</Text>
          </Space>
          <Space>
            <MailOutlined style={{ fontSize: 12 }} />
            <Text style={{ fontSize: 12 }} type="secondary">
              {record.email}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Capacidad",
      dataIndex: "capacidad",
      key: "capacidad",
      width: 90,
      render: (n: number | null) => (
        <Space>
          <CarOutlined />
          <Text>{n ?? "—"} {n != null ? "pax" : ""}</Text>
        </Space>
      ),
    },
    {
      title: "Rutas",
      dataIndex: "rutasAsignadas",
      key: "rutasAsignadas",
      width: 80,
    },
    {
      title: "Estado",
      dataIndex: "estadoOperativo",
      key: "estadoOperativo",
      width: 120,
      render: (status: string) => {
        const color = status === "En ruta" ? "blue" : "green";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const filtered = drivers.filter((d) => {
    const matchSearch =
      !search ||
      d.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (d.patente?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = !statusFilter || d.estadoOperativo === statusFilter;
    return matchSearch && matchStatus;
  });

  const enRuta = drivers.filter((d) => d.estadoOperativo === "En ruta").length;
  const disponibles = drivers.filter((d) => d.estadoOperativo === "Disponible").length;

  if (loading) {
    return <PageLoading label="Cargando transportistas..." />;
  }

  if (error) {
    return <Alert type="error" message={error} showIcon />;
  }

  return (
    <>
      <PageHeader
        title="Transportistas"
        description="Conductores, vehículos y disponibilidad según viajes en curso."
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <StatCard title="Total" value={drivers.length} icon={<UserOutlined />} />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="En ruta" value={enRuta} icon={<CarOutlined />} accent="#1565e8" />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="Disponibles" value={disponibles} accent="#12b76a" />
        </Col>
      </Row>

      <Card
        title="Listado"
        extra={
          <Space wrap>
            <Input
              placeholder="Buscar por nombre o patente"
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
              allowClear
              aria-label="Buscar transportistas"
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
              ]}
              aria-label="Filtrar por estado"
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filtered.map((d) => ({ ...d, key: d.id }))}
          pagination={{ pageSize: 10, showTotal: (t) => `Total: ${t}` }}
          scroll={{ x: 700 }}
        />
      </Card>
    </>
  );
}