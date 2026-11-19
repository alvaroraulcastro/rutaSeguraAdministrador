"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Select,
  Space,
  Button,
  Alert,
  Tooltip,
  Modal,
  App,
  Input,
} from "antd";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import { ReloadOutlined, PlayCircleOutlined, CheckCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Text } = Typography;

type EstadoViaje = "PENDIENTE" | "EN_CURSO" | "COMPLETADO" | "CANCELADO";

interface ViajeApi {
  id: string;
  fecha: string;
  estado: EstadoViaje;
  paradaActualOrden: number;
  ultimaUbicacionEn: string | null;
  ultimaLat: number | null;
  ultimaLng: number | null;
  ruta: {
    nombre: string;
    transportista: { nombre: string };
    paradas: { orden: number; pasajero: { nombre: string } }[];
  };
  notificaciones: { id: string }[];
}

const estadoTag: Record<EstadoViaje, { color: string; label: string }> = {
  PENDIENTE: { color: "default", label: "Pendiente" },
  EN_CURSO: { color: "processing", label: "En curso" },
  COMPLETADO: { color: "success", label: "Completado" },
  CANCELADO: { color: "error", label: "Cancelado" },
};

interface RutaOpcion {
  id: string;
  nombre: string;
}

export default function ViajesClient() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [viajes, setViajes] = useState<ViajeApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoViaje | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rutas, setRutas] = useState<RutaOpcion[]>([]);
  const [rutaId, setRutaId] = useState<string | null>(null);
  const [fechaViaje, setFechaViaje] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [creando, setCreando] = useState(false);
  const apiKey = user?.apiKey;

  const cargar = async () => {
    if (!apiKey) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(getApiUrl("/api/v1/viajes"), {
        headers: { "X-API-Key": apiKey },
      });
      if (!res.ok) throw new Error("Error al cargar viajes");
      setViajes(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!apiKey) return;
    const frame = requestAnimationFrame(() => {
      void cargar();
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recargar cuando cambia la apiKey
  }, [apiKey]);

  const abrirCrear = async () => {
    if (!apiKey) return;
    setModalAbierto(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/rutas"), { headers: { "X-API-Key": apiKey } });
      if (!res.ok) throw new Error("No se pudieron cargar las rutas");
      const lista: RutaOpcion[] = await res.json();
      setRutas(lista);
      setRutaId(lista[0]?.id ?? null);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Error al cargar rutas");
    }
  };

  const crearViaje = async () => {
    if (!apiKey || !rutaId) return;
    setCreando(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/viajes"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
        body: JSON.stringify({ rutaId, fecha: new Date(fechaViaje).toISOString() }),
      });
      if (!res.ok) throw new Error("No se pudo crear el viaje");
      message.success("Viaje creado");
      setModalAbierto(false);
      await cargar();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setCreando(false);
    }
  };

  const cambiarEstado = async (id: string, estado: EstadoViaje) => {
    if (!apiKey) return;
    setUpdatingId(id);
    try {
      const res = await fetch(getApiUrl(`/api/v1/viajes/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) throw new Error("No se pudo actualizar el viaje");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtrados = viajes.filter((v) => !filtroEstado || v.estado === filtroEstado);

  const columns = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (f: string) => new Date(f).toLocaleString("es-CL"),
    },
    {
      title: "Ruta",
      key: "ruta",
      render: (_: unknown, v: ViajeApi) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v.ruta.nombre}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {v.ruta.transportista.nombre}
          </Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (e: EstadoViaje) => <Tag color={estadoTag[e].color}>{estadoTag[e].label}</Tag>,
    },
    {
      title: "Parada #",
      dataIndex: "paradaActualOrden",
      key: "paradaActualOrden",
      width: 90,
    },
    {
      title: "Último GPS",
      key: "gps",
      render: (_: unknown, v: ViajeApi) =>
        v.ultimaUbicacionEn ? (
          <Tooltip title={`${v.ultimaLat?.toFixed(5)}, ${v.ultimaLng?.toFixed(5)}`}>
            <Text style={{ fontSize: 12 }}>{new Date(v.ultimaUbicacionEn).toLocaleString("es-CL")}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Alertas",
      key: "notif",
      width: 80,
      render: (_: unknown, v: ViajeApi) => v.notificaciones.length,
    },
    {
      title: "Acciones",
      key: "actions",
      width: 200,
      render: (_: unknown, v: ViajeApi) => (
        <Space>
          {v.estado === "PENDIENTE" && (
            <Button
              size="small"
              icon={<PlayCircleOutlined />}
              loading={updatingId === v.id}
              onClick={() => cambiarEstado(v.id, "EN_CURSO")}
            >
              Iniciar
            </Button>
          )}
          {v.estado === "EN_CURSO" && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={updatingId === v.id}
              onClick={() => cambiarEstado(v.id, "COMPLETADO")}
            >
              Finalizar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (loading && viajes.length === 0) {
    return <PageLoading label="Cargando viajes..." />;
  }

  return (
    <>
      <PageHeader
        title="Viajes"
        description="Monitorea el estado de cada recorrido e inicia o finaliza viajes de prueba."
        extra={
          <>
            <Select
              placeholder="Estado"
              allowClear
              style={{ width: 160 }}
              value={filtroEstado}
              onChange={setFiltroEstado}
              options={Object.keys(estadoTag).map((k) => ({
                value: k,
                label: estadoTag[k as EstadoViaje].label,
              }))}
            />
            <Button icon={<ReloadOutlined />} onClick={() => void cargar()} loading={loading}>
              Actualizar
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => void abrirCrear()}>
              Nuevo viaje
            </Button>
          </>
        }
      />

      <Modal
        title="Programar viaje"
        open={modalAbierto}
        onCancel={() => setModalAbierto(false)}
        onOk={() => void crearViaje()}
        confirmLoading={creando}
        okText="Crear"
        cancelText="Cancelar"
        okButtonProps={{ disabled: !rutaId }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text type="secondary">Ruta</Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Selecciona ruta"
              value={rutaId}
              onChange={setRutaId}
              options={rutas.map((r) => ({ value: r.id, label: r.nombre }))}
            />
          </div>
          <div>
            <Text type="secondary">Fecha y hora</Text>
            <Input
              type="datetime-local"
              style={{ width: "100%", marginTop: 4 }}
              value={fechaViaje}
              onChange={(e) => setFechaViaje(e.target.value)}
              aria-label="Fecha y hora del viaje"
            />
          </div>
        </Space>
      </Modal>

      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtrados}
          pagination={{ pageSize: 15, showTotal: (t) => `Total: ${t}` }}
          scroll={{ x: 900 }}
          loading={loading}
        />
      </Card>
    </>
  );
}