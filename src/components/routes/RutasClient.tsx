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

import { useAuth } from "@/contexts/AuthContext";

const { Title, Text } = Typography;

interface Ruta {
  id: string;
  nombre: string;
  tipo: string;
  transportista: { nombre: string } | null;
  paradas: { id: string }[] | null;
}

export default function RutasClient() {
  const { user } = useAuth();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRutas = async () => {
      if (!user?.apiKey) return;
      try {
        setLoading(true);
        const response = await fetch("/api/v1/rutas", {
          headers: {
            "X-API-Key": user.apiKey,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al obtener las rutas");
        }

        const data = await response.json();
        setRutas(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocurrió un error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRutas();
  }, [user?.apiKey]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "¿Estás seguro de que quieres eliminar esta ruta?",
      content: "Esta acción no se puede deshacer.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "No, cancelar",
      onOk: async () => {
        if (!user?.apiKey) return;
        try {
          const response = await fetch(`/api/v1/rutas/${id}`, {
            method: "DELETE",
            headers: { "X-API-Key": user.apiKey },
          });

          if (!response.ok) {
            throw new Error("Error al eliminar la ruta");
          }

          setRutas((prev) => prev.filter((ruta) => ruta.id !== id));
          notification.success({
            message: "Ruta Eliminada",
            description: "La ruta ha sido eliminada exitosamente.",
          });
        } catch (err: unknown) {
          if (err instanceof Error) {
            notification.error({
              message: "Error",
              description: err.message,
            });
          }
        }
      },
    });
  };

  const columns = [
    {
      title: "Nombre Ruta",
      dataIndex: "nombre",
      key: "nombre",
      render: (text: string, record: Ruta) => (
        <Space direction="vertical" size={0}>
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
      render: (transportista: { nombre: string } | null) => (
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
      render: (paradas: { id: string }[] | null) => (
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
      render: (_: unknown, record: Ruta) => (
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
          style={{ width: 300 }}
          onSearch={(value) => console.log("Searching for:", value)}
        />
        <Space>
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
