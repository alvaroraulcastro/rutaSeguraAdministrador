"use client";

import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Progress, Tag, Select, Button, Alert, App } from "antd";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import PageLoading from "@/components/PageLoading";
import {
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";


const columns = [
  {
    title: "Fecha",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Viajes",
    dataIndex: "totalRoutes",
    key: "totalRoutes",
  },
  {
    title: "Completados",
    dataIndex: "completed",
    key: "completed",
    render: (count: number) => <Tag color="green">{count}</Tag>,
  },
  {
    title: "Cancelados",
    dataIndex: "incidents",
    key: "incidents",
    render: (count: number) => (
      <Tag color={count > 0 ? "red" : "blue"}>{count}</Tag>
    ),
  },
  {
    title: "Cumplimiento",
    dataIndex: "punctuality",
    key: "punctuality",
    render: (value: number) => (
      <Progress percent={value} size="small" style={{ margin: 0, minWidth: 100 }} />
    ),
  },
];

interface ReporteOperacion {
  eficiencia: number | null;
  incidenciasMes: number;
  historial: {
    key: string;
    date: string;
    totalRoutes: number;
    completed: number;
    incidents: number;
    punctuality: number;
  }[];
}

export default function ReportsClient() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [period, setPeriod] = useState<string>("7");
  const [data, setData] = useState<ReporteOperacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user?.apiKey) return;
      try {
        setLoading(true);
        const res = await fetch(
          getApiUrl(`/api/v1/reportes/operacion?dias=${period}`),
          { headers: { "X-API-Key": user.apiKey } }
        );
        if (!res.ok) throw new Error("Error al cargar reportes");
        setData(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [user?.apiKey, period]);

  const exportPlaceholder = (formato: string) => {
    message.info(`Exportación ${formato} pendiente de implementación`);
  };

  if (loading) {
    return <PageLoading label="Generando reporte..." />;
  }

  if (error || !data) {
    return <Alert type="error" message={error ?? "Sin datos"} showIcon />;
  }

  return (
    <>
      <PageHeader
        title="Reportes operativos"
        description="Eficiencia de viajes y cumplimiento según el período seleccionado."
        extra={
          <>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 160 }}
              options={[
                { value: "7", label: "Últimos 7 días" },
                { value: "30", label: "Últimos 30 días" },
                { value: "90", label: "Últimos 90 días" },
              ]}
              aria-label="Período del reporte"
            />
            <Button icon={<FileExcelOutlined />} onClick={() => exportPlaceholder("Excel")}>
              Excel
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={() => exportPlaceholder("PDF")}>
              PDF
            </Button>
          </>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <StatCard
            title="Eficiencia"
            value={data.eficiencia ?? 0}
            precision={1}
            suffix="%"
            icon={<CheckCircleOutlined />}
            accent="#12b76a"
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard
            title="Notificaciones fallidas"
            value={data.incidenciasMes}
            icon={<WarningOutlined />}
            accent={data.incidenciasMes > 0 ? "#f04438" : undefined}
          />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="Días con actividad" value={data.historial.length} icon={<ClockCircleOutlined />} />
        </Col>
      </Row>

      <Card title="Historial diario" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={data.historial}
          pagination={{ pageSize: 10, showTotal: (t) => `Total: ${t}` }}
          scroll={{ x: 600 }}
          locale={{ emptyText: "Sin viajes en el período" }}
        />
      </Card>
    </>
  );
}