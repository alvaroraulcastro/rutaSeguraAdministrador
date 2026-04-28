"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
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
} from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title, Text } = Typography;

interface Pasajero {
  id: string;
  nombre: string;
  telefono: string;
  activo: boolean;
  direccionDomicilio: string;
  nombreDestino: string;
  direccionDestino: string;
  contactos: { id: string; nombre: string; telefono: string }[];
}

export default function PasajerosClient() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPasajeros = async () => {
      if (!user?.apiKey) {
        setLoading(false);
        setError("No autenticado");
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("/api/v1/pasajeros"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (response.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("Error al obtener los pasajeros");
        const data = await response.json();
        setPasajeros(data);
        setError(null);
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
    fetchPasajeros();
  }, [user?.apiKey, logout, router]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "¿Estás seguro de eliminar a este pasajero?",
      content: "Esta acción es permanente.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        if (!user?.apiKey) return;
        try {
          const response = await fetch(getApiUrl(`/api/v1/pasajeros/${id}`), {
            method: "DELETE",
            headers: { "X-API-Key": user.apiKey },
          });
          if (response.status === 401) {
            logout();
            router.replace("/login");
            return;
          }
          if (!response.ok) throw new Error("Error al eliminar el pasajero");
          setPasajeros((prev) => prev.filter((p) => p.id !== id));
          notification.success({ message: "Pasajero eliminado exitosamente" });
        } catch (err: unknown) {
          if (err instanceof Error) {
            notification.error({ message: "Error", description: err.message });
          }
        }
      },
    });
  };

  const handleToggleActivo = (record: Pasajero) => {
    const nextActivo = !record.activo;
    Modal.confirm({
      title: nextActivo ? "¿Reactivar pasajero?" : "¿Desactivar pasajero?",
      content: nextActivo
        ? "El pasajero volverá a estar disponible."
        : "El pasajero quedará inactivo, pero no se eliminará.",
      okText: nextActivo ? "Reactivar" : "Desactivar",
      okType: nextActivo ? "primary" : "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        if (!user?.apiKey) return;
        try {
          const response = await fetch(getApiUrl(`/api/v1/pasajeros/${record.id}`), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": user.apiKey,
            },
            body: JSON.stringify({ activo: nextActivo }),
          });
          if (response.status === 401) {
            logout();
            router.replace("/login");
            return;
          }
          if (!response.ok) throw new Error("Error al actualizar el estado del pasajero");
          const updated = (await response.json()) as Pasajero;
          setPasajeros((prev) => prev.map((p) => (p.id === record.id ? { ...p, activo: updated.activo } : p)));
          notification.success({ message: nextActivo ? "Pasajero reactivado" : "Pasajero desactivado" });
        } catch (err: unknown) {
          if (err instanceof Error) {
            notification.error({ message: "Error", description: err.message });
          }
        }
      },
    });
  };

  const columns = [
    {
      title: "Pasajero",
      dataIndex: "nombre",
      key: "nombre",
      render: (text: string, record: Pasajero) => (
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
      render: (text: string, record: Pasajero) => (
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
      render: (contactos: { id: string; nombre: string; telefono: string }[]) => (
        <Space>
          <Text>{contactos?.length || 0}</Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      render: (activo: boolean) => (
        <Text type={activo ? "success" : "danger"}>{activo ? "Activo" : "Inactivo"}</Text>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: unknown, record: Pasajero) => (
        <Space>
          <Tooltip title="Editar Pasajero">
            <Link href={`/passengers/${record.id}/edit`}>
              <Button icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title={record.activo ? "Desactivar" : "Reactivar"}>
            <Button danger={record.activo} onClick={() => handleToggleActivo(record)}>
              {record.activo ? "Desactivar" : "Reactivar"}
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar Pasajero">
            <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" description="Cargando pasajeros..." />;
  }

  if (error) {
    return <Alert title="Error" description={error} type="error" showIcon />;
  }

  return (
    <Card>
      <Title level={4}>Gestión de Pasajeros</Title>
      <Text>Administra la información de los pasajeros y sus contactos.</Text>
      <Space style={{ margin: "16px 0", width: "100%", justifyContent: "space-between" }}>
        <Input.Search
          placeholder="Buscar por nombre o dirección"
          style={{ width: 300 }}
          onSearch={(value) => console.log("Searching for:", value)}
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
