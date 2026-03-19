"use client";

import React, { useState, useEffect } from "react";
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
  Spin,
  Alert,
  Modal,
  notification,
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

// TODO: Mover a un contexto de autenticación o variable de entorno
const API_KEY = "tu_api_key_aqui"; // Reemplaza con una API Key válida obtenida del registro

export default function RutasClient() {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/v1/rutas", {
          headers: {
            "X-API-Key": API_KEY,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al obtener las rutas");
        }

        const data = await response.json();
        setRutas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRutas();
  }, []);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "¿Estás seguro de que quieres eliminar esta ruta?",
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "No, cancelar",
      onOk: async () => {
        try {
          const response = await fetch(`/api/v1/rutas/${id}`, {
            method: "DELETE",
            headers: { "X-API-Key": API_KEY },
          });

          if (!response.ok) {
            throw new Error("Error al eliminar la ruta");
          }

          setRutas(rutas.filter((ruta: any) => ruta.id !== id));
          notification.success({
            message: "Ruta Eliminada",
            description: "La ruta ha sido eliminada exitosamente.",
          });
        } catch (err: any) {
          notification.error({
            message: "Error",
            description: err.message,
          });
        }
      },
    });
  };

  const columns = [
    {
      title: "Nombre Ruta",
      dataIndex: "nombre",
      key: "nombre",
      render: (text: string, record: any) => (
        <Space orientation="vertical" size={0}>
          <Space>
            <EnvironmentOutlined style={{ color: "#1677ff" }} />
            <Text strong>{text}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <CalendarOutlined /> ID: {record.id.substring(0, 8)}
          </Text>
        </Space>
      ),
    },
    {
      title: "Transportista",
      dataIndex: "transportista",
      key: "transportista",
      render: (transportista: any) => (
        <Space>
          <CarOutlined />
          <Text>{transportista?.nombre || "No asignado"}</Text>
        </Space>
      ),
    },
    {
      title: "Pasajeros",
      dataIndex: "paradas",
      key: "pasajeros",
      render: (paradas: any[]) => (
        <Space>
          <TeamOutlined />
          <Text>{paradas?.length || 0}</Text>
        </Space>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => <Tag>{tipo.replace("_", " ")}</Tag>,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Ver Detalles / Gestionar Paradas">
            <Link href={`/routes/${record.id}/stops`}>
              <Button icon={<EyeOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Editar">
            <Link href={`/routes/${record.id}/edit`}>
              <Button icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" tip="Cargando rutas..."><div style={{ height: 300 }} /></Spin>;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <Card>
      <Title level={4}>Gestión de Rutas</Title>
      <Text>Crea, visualiza y administra las rutas de transporte.</Text>
      <Space style={{ margin: "16px 0", width: "100%", justifyContent: "space-between" }}>
        <Input.Search
          placeholder="Buscar por nombre o transportista"
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Space>
          <Select placeholder="Filtrar por tipo" style={{ width: 150 }} onChange={setTypeFilter} allowClear>
            <Select.Option value="IDA">IDA</Select.Option>
            <Select.Option value="VUELTA">VUELTA</Select.Option>
            <Select.Option value="IDA_Y_VUELTA">IDA Y VUELTA</Select.Option>
          </Select>
          <Link href="/routes/new">
            <Button type="primary" icon={<PlusOutlined />}>
              Crear Ruta
            </Button>
          </Link>
        </Space>
      </Space>
      <Table columns={columns} dataSource={rutas} rowKey="id" />
    </Card>
  );
}
