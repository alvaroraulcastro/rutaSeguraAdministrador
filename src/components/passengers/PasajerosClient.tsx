"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Avatar,
  Input,
  Tooltip,
  Alert,
  Modal,
  notification,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";
import EmptyState from "@/components/EmptyState";

const { Title, Text } = Typography;

interface Pasajero {
  id: string;
  nombre: string;
  telefono: string;
  direccionDomicilio: string;
  nombreDestino: string;
  direccionDestino: string;
  contactos: { id: string; nombre: string; telefono: string }[];
}

export default function PasajerosClient() {
  const { user } = useAuth();
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPasajeros = async () => {
      if (!user?.apiKey) return;
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("/api/v1/pasajeros"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (!response.ok) throw new Error("Error al obtener los pasajeros");
        const data = await response.json();
        setPasajeros(data);
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
  }, [user?.apiKey]);

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

  const filteredPasajeros = pasajeros.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.direccionDomicilio.toLowerCase().includes(q) ||
      p.telefono.toLowerCase().includes(q)
    );
  });

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
      title: "Contactos",
      dataIndex: "contactos",
      key: "contactos",
      render: (contactos: { id: string; nombre: string; telefono: string }[]) => (
        <Text>{contactos?.length || 0}</Text>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 120,
      render: (_: unknown, record: Pasajero) => (
        <Space>
          <Tooltip title="Editar Pasajero">
            <Link href={`/passengers/${record.id}/edit`}>
              <Button icon={<EditOutlined />} aria-label="Editar pasajero" />
            </Link>
          </Tooltip>
          <Tooltip title="Eliminar Pasajero">
            <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} aria-label="Eliminar pasajero" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <Skeleton active title paragraph={{ rows: 1 }} />
        <Skeleton active title={false} paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  if (error) {
    return <Alert title="Error al cargar pasajeros" description={error} type="error" showIcon />;
  }

  return (
    <>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          Pasajeros
        </Title>
        <Link href="/passengers/new">
          <Button type="primary" icon={<PlusOutlined />} aria-label="Añadir pasajero">
            Añadir Pasajero
          </Button>
        </Link>
      </div>

      <Card
        title={`Total: ${pasajeros.length} pasajeros`}
        extra={
          <Input.Search
            placeholder="Buscar por nombre, dirección o teléfono"
            style={{ width: 300 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            aria-label="Buscar pasajeros"
          />
        }
      >
        {filteredPasajeros.length === 0 ? (
          <EmptyState
            title="No hay pasajeros"
            description={searchQuery ? "No se encontraron resultados para tu búsqueda." : "Aún no has registrado pasajeros en el sistema."}
            action={
              !searchQuery
                ? {
                    label: "Añadir Pasajero",
                    onClick: () => window.location.assign("/passengers/new"),
                    icon: <PlusOutlined />,
                  }
                : undefined
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredPasajeros}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
            scroll={{ x: 700 }}
          />
        )}
      </Card>
    </>
  );
}
