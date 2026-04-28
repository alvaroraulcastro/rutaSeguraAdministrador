"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Alert,
  Card,
  Statistic,
  Spin,
  Table,
  Typography,
  Progress,
  Tag,
  Select,
  DatePicker,
  Button,
  Space,
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const columns = [
  {
    title: "Fecha",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Rutas Totales",
    dataIndex: "totalRoutes",
    key: "totalRoutes",
  },
  {
    title: "Completadas",
    dataIndex: "completed",
    key: "completed",
    render: (count: number) => <Tag color="green">{count}</Tag>,
  },
  {
    title: "Incidentes",
    dataIndex: "incidents",
    key: "incidents",
    render: (count: number) => (
      <Tag color={count > 0 ? "red" : "blue"}>{count}</Tag>
    ),
  },
  {
    title: "Puntualidad",
    dataIndex: "punctuality",
    key: "punctuality",
    render: (value: number) => <Progress percent={value} size="small" style={{ margin: 0, minWidth: 100 }} />,
  },
];

const data = [
  { key: "1", date: "2026-03-16", totalRoutes: 45, completed: 45, incidents: 0, punctuality: 98 },
  { key: "2", date: "2026-03-15", totalRoutes: 45, completed: 42, incidents: 3, punctuality: 92 },
  { key: "3", date: "2026-03-14", totalRoutes: 40, completed: 40, incidents: 1, punctuality: 95 },
  { key: "4", date: "2026-03-13", totalRoutes: 42, completed: 41, incidents: 2, punctuality: 94 },
  { key: "5", date: "2026-03-12", totalRoutes: 38, completed: 38, incidents: 0, punctuality: 100 },
];

type ViajeApi = {
  id: string;
  fecha: string;
  estado: "PENDIENTE" | "EN_CURSO" | "COMPLETADO" | "CANCELADO";
  ruta: { nombre: string; paradas: { id: string }[] };
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>("7");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viajes, setViajes] = useState<ViajeApi[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.apiKey) return;
      if (user.rol === "ADMIN") return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/v1/viajes", { headers: { "X-API-Key": user.apiKey } });
        if (!res.ok) throw new Error("No se pudieron cargar los viajes");
        const data = (await res.json()) as ViajeApi[];
        setViajes(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.apiKey, user?.rol]);

  const asistenciaPorViaje = useMemo(() => {
    return viajes.slice(0, 20).map((v) => {
      const pasajeros = v.ruta.paradas?.length ?? 0;
      const asistencia = pasajeros;
      const porcentaje = pasajeros === 0 ? 0 : Math.round((asistencia / pasajeros) * 100);
      return {
        key: v.id,
        id: v.id,
        fecha: new Date(v.fecha).toLocaleString(),
        ruta: v.ruta.nombre,
        estado: v.estado,
        pasajeros,
        asistencia,
        porcentaje,
      };
    });
  }, [viajes]);

  const resumenSemanal = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const bucket = new Map<string, { date: string; viajes: number; completados: number; pendientes: number; cancelados: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      bucket.set(key, { date: key, viajes: 0, completados: 0, pendientes: 0, cancelados: 0 });
    }

    for (const v of viajes) {
      const key = new Date(v.fecha).toISOString().slice(0, 10);
      const row = bucket.get(key);
      if (!row) continue;
      row.viajes += 1;
      if (v.estado === "COMPLETADO") row.completados += 1;
      else if (v.estado === "CANCELADO") row.cancelados += 1;
      else row.pendientes += 1;
    }

    return Array.from(bucket.values()).map((r) => ({ ...r, key: r.date }));
  }, [viajes]);

  const asistenciaColumns = useMemo(
    () => [
      { title: "Fecha", dataIndex: "fecha", key: "fecha", width: 180 },
      { title: "Ruta", dataIndex: "ruta", key: "ruta" },
      { title: "Pasajeros", dataIndex: "pasajeros", key: "pasajeros", width: 110 },
      {
        title: "Asistencia",
        dataIndex: "asistencia",
        key: "asistencia",
        width: 140,
        render: (a: number, r: { pasajeros: number }) => <Tag color={a === r.pasajeros ? "green" : "orange"}>{a}/{r.pasajeros}</Tag>,
      },
      {
        title: "Estado",
        dataIndex: "estado",
        key: "estado",
        width: 130,
        render: (estado: ViajeApi["estado"]) => {
          const color = estado === "EN_CURSO" ? "blue" : estado === "COMPLETADO" ? "green" : estado === "CANCELADO" ? "red" : "default";
          return <Tag color={color}>{estado}</Tag>;
        },
      },
      { title: "%", dataIndex: "porcentaje", key: "porcentaje", width: 80, render: (p: number) => <Progress percent={p} size="small" /> },
    ],
    []
  );

  const resumenColumns = useMemo(
    () => [
      { title: "Día", dataIndex: "date", key: "date", width: 130 },
      { title: "Viajes", dataIndex: "viajes", key: "viajes", width: 90 },
      { title: "Completados", dataIndex: "completados", key: "completados", width: 120, render: (n: number) => <Tag color="green">{n}</Tag> },
      { title: "Pendientes", dataIndex: "pendientes", key: "pendientes", width: 120, render: (n: number) => <Tag color="blue">{n}</Tag> },
      { title: "Cancelados", dataIndex: "cancelados", key: "cancelados", width: 120, render: (n: number) => <Tag color="red">{n}</Tag> },
    ],
    []
  );

  if (user?.rol !== "ADMIN") {
    if (loading) return <Spin tip="Cargando reportes..." />;
    if (error) return <Alert message="Error" description={error} type="error" showIcon />;

    return (
      <>
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Reportes de Transportista
            </Title>
            <Text type="secondary">Asistencia por viaje y resumen semanal.</Text>
          </div>
          <Space>
            <RangePicker />
            <Button icon={<FileExcelOutlined />}>Excel</Button>
            <Button icon={<FilePdfOutlined />}>PDF</Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Viajes (7 días)" value={resumenSemanal.reduce((a, r) => a + r.viajes, 0)} prefix={<CheckCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Completados (7 días)" value={resumenSemanal.reduce((a, r) => a + r.completados, 0)} prefix={<CheckCircleOutlined />} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Cancelados (7 días)" value={resumenSemanal.reduce((a, r) => a + r.cancelados, 0)} prefix={<WarningOutlined />} />
            </Card>
          </Col>
        </Row>

        <Card title="Asistencia por viaje" style={{ marginTop: 24 }}>
          <Table columns={asistenciaColumns} dataSource={asistenciaPorViaje} pagination={{ pageSize: 10, showTotal: (t) => `Total: ${t}` }} />
        </Card>

        <Card title="Resumen de la semana (viajes)" style={{ marginTop: 24 }}>
          <Table columns={resumenColumns} dataSource={resumenSemanal} pagination={false} />
        </Card>
      </>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Reportes Operativos
          </Title>
          <Text type="secondary">Resumen de eficiencia, puntualidad e incidencias.</Text>
        </div>
        <Space>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 140 }}
            options={[
              { value: "7", label: "Últimos 7 días" },
              { value: "30", label: "Últimos 30 días" },
              { value: "90", label: "Últimos 90 días" },
            ]}
          />
          <RangePicker />
          <Button icon={<FileExcelOutlined />}>Excel</Button>
          <Button icon={<FilePdfOutlined />}>PDF</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Eficiencia de Rutas"
              value={96.5}
              precision={2}
              styles={{ content: { color: "#3f8600" } }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Incidencias (Mes)"
              value={4}
              styles={{ content: { color: "#cf1322" } }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tiempo Promedio Viaje"
              value={28}
              prefix={<ClockCircleOutlined />}
              suffix="min"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Historial diario de operación" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showTotal: (t) => `Total: ${t}` }}
        />
      </Card>
    </>
  );
}
