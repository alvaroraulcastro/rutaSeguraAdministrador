"use client";

import React, { useState, useEffect } from "react";
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
  Input,
  Skeleton,
  Alert,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";
import EmptyState from "@/components/EmptyState";

const { Title, Text } = Typography;

interface NotificacionApi {
  id: string;
  mensaje: string;
  canal: string;
  tipo: string;
  estado: string;
  destinatario: string | null;
  enviadoEn: string;
  pasajero: {
    id: string;
    nombre: string;
    telefono: string;
  };
  viaje: {
    id: string;
    ruta: {
      id: string;
      nombre: string;
      transportista: {
        id: string;
        nombre: string;
      };
    };
  };
}

const statusConfig: Record<string, "success" | "processing" | "error" | "default"> = {
  ENVIADO: "success",
  PROCESANDO: "processing",
  FALLIDO: "error",
};

export default function NotificationsClient() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<NotificacionApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoFilter, setTipoFilter] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (!user?.apiKey) return;
      try {
        setLoading(true);
        const res = await fetch(getApiUrl("/api/v1/notificaciones"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (!res.ok) throw new Error("Error al obtener las notificaciones");
        const data = await res.json();
        setNotificaciones(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Ocurrió un error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchNotificaciones();
  }, [user?.apiKey]);

  const filtered = notificaciones.filter((n) => {
    const matchTipo = !tipoFilter || n.tipo === tipoFilter;
    const matchEstado = !estadoFilter || n.estado === estadoFilter;
    const matchSearch =
      !search ||
      n.pasajero.nombre.toLowerCase().includes(search.toLowerCase()) ||
      n.mensaje.toLowerCase().includes(search.toLowerCase()) ||
      (n.destinatario && n.destinatario.toLowerCase().includes(search.toLowerCase()));
    return matchTipo && matchEstado && matchSearch;
  });

  const enviados = notificaciones.filter((n) => n.estado === "ENVIADO").length;
  const fallidos = notificaciones.filter((n) => n.estado === "FALLIDO").length;
  const procesando = notificaciones.filter((n) => n.estado === "PROCESANDO").length;

  const columns: ColumnsType<NotificacionApi> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 90,
      render: (id: string) => <Text code>{id.substring(0, 8)}</Text>,
    },
    {
      title: "Pasajero",
      dataIndex: "pasajero",
      key: "pasajero",
      render: (_: unknown, record: NotificacionApi) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.pasajero.nombre}</Text>
          {record.destinatario && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              → {record.destinatario}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (
        <Tag color="blue">{tipo.replace(/_/g, " ")}</Tag>
      ),
    },
    {
      title: "Mensaje",
      dataIndex: "mensaje",
      key: "mensaje",
      ellipsis: true,
    },
    {
      title: "Canal",
      dataIndex: "canal",
      key: "canal",
      render: () => (
        <Space>
          <BellOutlined style={{ color: "#faad14" }} />
          <Text>Push (FCM)</Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado: string) => (
        <Badge status={statusConfig[estado] ?? "default"} text={estado} />
      ),
    },
    {
      title: "Fecha y hora",
      dataIndex: "enviadoEn",
      key: "enviadoEn",
      width: 170,
      render: (fecha: string) => (
        <Text>{new Date(fecha).toLocaleString("es-CL")}</Text>
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
    return (
      <Alert
        message="Error al cargar notificaciones"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <>
      <Title level={2}>Log de Notificaciones Push</Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        Historial de notificaciones FCM enviadas a pasajeros y contactos de emergencia.
      </Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Enviadas"
              value={enviados}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="En proceso"
              value={procesando}
              prefix={<BellOutlined />}
              styles={{ content: { color: "#1677ff" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Fallidas"
              value={fallidos}
              prefix={<BellOutlined />}
              styles={{ content: { color: "#cf1322" } }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={`Historial (${notificaciones.length} notificaciones)`}
        extra={
          <Space wrap>
            <Input
              placeholder="Buscar por pasajero o mensaje"
              prefix={<UserOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
              allowClear
              aria-label="Buscar notificaciones"
            />
            <Select
              placeholder="Tipo"
              allowClear
              style={{ width: 160 }}
              value={tipoFilter}
              onChange={setTipoFilter}
              options={[
                { value: "EN_CAMINO", label: "En camino" },
                { value: "EN_PUERTA", label: "En puerta" },
                { value: "LLEGADA_DESTINO", label: "Llegada a destino" },
                { value: "INICIO_RUTA", label: "Inicio de ruta" },
                { value: "FIN_RUTA", label: "Fin de ruta" },
              ]}
              aria-label="Filtrar por tipo"
            />
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 130 }}
              value={estadoFilter}
              onChange={setEstadoFilter}
              options={[
                { value: "ENVIADO", label: "Enviado" },
                { value: "PROCESANDO", label: "Procesando" },
                { value: "FALLIDO", label: "Fallido" },
              ]}
              aria-label="Filtrar por estado"
            />
          </Space>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            title="No hay notificaciones push"
            description={
              notificaciones.length === 0
                ? "Aún no hay notificaciones push para tus rutas."
                : "No se encontraron resultados para los filtros seleccionados."
            }
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Total: ${t}` }}
            scroll={{ x: 700 }}
            rowKey="id"
          />
        )}
      </Card>
    </>
  );
}
