"use client";

import React, { useEffect, useState } from "react";
import { Card, Col, Row, Table, Tag, Alert, Typography } from "antd";
import dynamic from "next/dynamic";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import PageLoading from "@/components/PageLoading";
import {
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";
import type { PosicionViaje } from "@/components/dashboard/DashboardViajesMap";

const DashboardViajesMap = dynamic(() => import("@/components/dashboard/DashboardViajesMap"), { ssr: false });

const { Text } = Typography;

interface ResumenDashboard {
  pasajerosTotal: number;
  rutasTotal: number;
  viajesActivos: number;
  notificacionesHoy: number;
  cumplimiento: number | null;
  viajesEnTabla: {
    id: string;
    transportista: string;
    ruta: string;
    estado: string;
    ultimaParada: string;
    ultimaUbicacionEn: string | null;
  }[];
  posicionesEnCurso?: PosicionViaje[];
}

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    ellipsis: true,
    width: 120,
    render: (id: string) => id.slice(0, 8) + "…",
  },
  {
    title: "Transportista",
    dataIndex: "transportista",
    key: "transportista",
  },
  {
    title: "Ruta",
    dataIndex: "ruta",
    key: "ruta",
  },
  {
    title: "Estado",
    key: "estado",
    dataIndex: "estado",
    render: (status: string) => (
      <Tag color={status === "En curso" ? "blue" : status === "Completada" ? "green" : "default"}>
        {status}
      </Tag>
    ),
  },
  {
    title: "Parada actual",
    dataIndex: "ultimaParada",
    key: "ultimaParada",
  },
];

export default function DashboardClient() {
  const { user } = useAuth();
  const [data, setData] = useState<ResumenDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumen = async () => {
      if (!user?.apiKey) return;
      try {
        setLoading(true);
        const res = await fetch(getApiUrl("/api/v1/dashboard/resumen"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (!res.ok) throw new Error("No se pudo cargar el resumen");
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, [user?.apiKey]);

  if (loading) {
    return <PageLoading label="Cargando resumen operativo..." />;
  }

  if (error || !data) {
    return <Alert type="error" message={error ?? "Sin datos"} showIcon />;
  }

  const posiciones = data.posicionesEnCurso ?? [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Indicadores del día y estado de los viajes en curso."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Viajes en curso"
            value={data.viajesActivos}
            icon={<CarOutlined />}
            accent="#1565e8"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Pasajeros" value={data.pasajerosTotal} icon={<TeamOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Notificaciones hoy" value={data.notificacionesHoy} icon={<BellOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Cumplimiento hoy"
            value={data.cumplimiento ?? 0}
            precision={1}
            suffix="%"
            icon={<EnvironmentOutlined />}
            accent={data.cumplimiento != null ? "#12b76a" : undefined}
          />
        </Col>
      </Row>

      {posiciones.length > 0 && (
        <Card title="Última posición GPS · viajes en curso" className="page-section" style={{ marginTop: 20 }}>
          <DashboardViajesMap puntos={posiciones} />
          <Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
            Solo viajes con estado EN_CURSO y al menos una coordenada reportada.
          </Text>
        </Card>
      )}

      <Card title={`Viajes de hoy · ${data.rutasTotal} rutas activas`} className="page-section" style={{ marginTop: 20 }}>
        <Table
          columns={columns}
          dataSource={data.viajesEnTabla.map((v) => ({ ...v, key: v.id }))}
          scroll={{ x: 600 }}
          locale={{ emptyText: "No hay viajes registrados hoy" }}
          pagination={{ pageSize: 10, showTotal: (t) => `${t} registros` }}
          size="middle"
        />
      </Card>
    </>
  );
}