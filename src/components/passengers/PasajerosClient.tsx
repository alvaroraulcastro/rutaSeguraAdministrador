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
  Avatar,
  Input,
  Tooltip,
  Spin,
  Alert,
  Modal,
  notification,
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

// TODO: Mover a un contexto de autenticación o variable de entorno
const API_KEY = "tu_api_key_aqui"; // Reemplaza con una API Key válida

export default function PasajerosClient() {
  const [pasajeros, setPasajeros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPasajeros = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/v1/pasajeros", {
          headers: { "X-API-Key": API_KEY },
        });
        if (!response.ok) throw new Error("Error al obtener los pasajeros");
        const data = await response.json();
        setPasajeros(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPasajeros();
  }, []);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "¿Estás seguro de eliminar a este pasajero?",
      content: "Esta acción es permanente.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await fetch(`/api/v1/pasajeros/${id}`, {
            method: "DELETE",
            headers: { "X-API-Key": API_KEY },
          });
          if (!response.ok) throw new Error("Error al eliminar el pasajero");
          setPasajeros(pasajeros.filter((p: any) => p.id !== id));
          notification.success({ message: "Pasajero eliminado exitosamente" });
        } catch (err: any) {
          notification.error({ message: "Error", description: err.message });
        }
      },
    });
  };

  const columns = [
    {
      title: "Pasajero",
      dataIndex: "nombre",
      key: "nombre",
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Text type="secondary">{record.telefono}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Domicilio",
      dataIndex: "direccionDomicilio",
      key: "domicilio",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Destino",
      dataIndex: "nombreDestino",
      key: "destino",
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text>{text}</Text>
          <Text type="secondary">{record.direccionDestino}</Text>
        </Space>
      ),
    },
    {
      title: "Contactos de Notificación",
      dataIndex: "contactos",
      key: "contactos",
      render: (contactos: any[]) => (
        <Space>
          <TeamOutlined />
          <Text>{contactos?.length || 0}</Text>
        </Space>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Editar Pasajero">
            <Link href={`/passengers/${record.id}/edit`}>
              <Button icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Eliminar Pasajero">
            <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" tip="Cargando pasajeros..." />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <Card>
      <Title level={4}>Gestión de Pasajeros</Title>
      <Text>Administra la información de los pasajeros y sus contactos.</Text>
      <Space style={{ margin: "16px 0", width: "100%", justifyContent: "space-between" }}>
        <Input.Search
          placeholder="Buscar por nombre o dirección"
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Link href="/passengers/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Añadir Pasajero
          </Button>
        </Link>
      </Space>
      <Table columns={columns} dataSource={pasajeros} rowKey="id" />
    </Card>
  );
}
