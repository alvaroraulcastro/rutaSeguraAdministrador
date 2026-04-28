"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Col, Row, Spin, Statistic, Table, Tag, Typography, Space, Divider, Progress, Rate } from "antd";
import {
  CarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  MailOutlined,
  UserOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
const { Title, Text } = Typography;

type ViajeApi = {
  id: string;
  fecha: string;
  estado: "PENDIENTE" | "EN_CURSO" | "COMPLETADO" | "CANCELADO";
  ruta: {
    id: string;
    nombre: string;
    transportista: { id: string; nombre: string } | null;
    paradas: { id: string }[];
  };
  notificaciones: { id: string }[];
};

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viajes, setViajes] = useState<ViajeApi[]>([]);
  const [rutasCount, setRutasCount] = useState(0);
  const [pasajerosCount, setPasajerosCount] = useState(0);
  const [transportistasCount, setTransportistasCount] = useState(0);

  const handleCreateTrip = () => {
    router.push("/routes/new");
  };

  const handleAddPassengers = () => {
    router.push("/passengers");
  };

  useEffect(() => {
    const load = async () => {
      if (!user?.apiKey) return;
      try {
        setLoading(true);
        setError(null);

        // Simulate network delay for a more realistic UI feel
        await new Promise((resolve) => setTimeout(resolve, 800));

        const isAdmin = user.rol === "ADMIN";
        
        const mockViajes: ViajeApi[] = isAdmin ? [
          {
            id: "v-001",
            fecha: new Date().toISOString(),
            estado: "EN_CURSO",
            ruta: { id: "r-001", nombre: "Ruta Norte", transportista: { id: "t-001", nombre: "Juan Pérez" }, paradas: [{ id: "p-1" }, { id: "p-2" }, { id: "p-3" }] },
            notificaciones: [{ id: "n-1" }]
          },
          {
            id: "v-002",
            fecha: new Date().toISOString(),
            estado: "COMPLETADO",
            ruta: { id: "r-002", nombre: "Ruta Sur", transportista: { id: "t-002", nombre: "María Gómez" }, paradas: [{ id: "p-4" }, { id: "p-5" }] },
            notificaciones: []
          },
          {
            id: "v-003",
            fecha: new Date(Date.now() + 86400000).toISOString(),
            estado: "PENDIENTE",
            ruta: { id: "r-003", nombre: "Ruta Este", transportista: { id: "t-003", nombre: "Carlos Ruiz" }, paradas: [{ id: "p-6" }] },
            notificaciones: []
          },
          {
            id: "v-004",
            fecha: new Date().toISOString(),
            estado: "CANCELADO",
            ruta: { id: "r-004", nombre: "Ruta Oeste", transportista: { id: "t-004", nombre: "Ana López" }, paradas: [{ id: "p-7" }, { id: "p-8" }] },
            notificaciones: [{ id: "n-2" }, { id: "n-3" }]
          },
          {
            id: "v-006",
            fecha: new Date().toISOString(),
            estado: "PENDIENTE",
            ruta: { id: "r-006", nombre: "Ruta Central", transportista: { id: "t-005", nombre: "Luis Martínez" }, paradas: [{ id: "p-9" }, { id: "p-10" }] },
            notificaciones: []
          }
        ] : [
          {
            id: "v-001",
            fecha: new Date().toISOString(),
            estado: "EN_CURSO",
            ruta: { id: "r-001", nombre: "Ruta Asignada 1", transportista: { id: "t-123", nombre: "Tú (Mismo)" }, paradas: [{ id: "p-1" }, { id: "p-2" }] },
            notificaciones: [{ id: "n-1" }]
          },
          {
            id: "v-005",
            fecha: new Date().toISOString(),
            estado: "COMPLETADO",
            ruta: { id: "r-005", nombre: "Ruta Asignada 2", transportista: { id: "t-123", nombre: "Tú (Mismo)" }, paradas: [{ id: "p-3" }, { id: "p-4" }, { id: "p-5" }] },
            notificaciones: []
          }
        ];

        setViajes(mockViajes);
        setRutasCount(isAdmin ? 15 : 2);
        setPasajerosCount(isAdmin ? 120 : 18);
        setTransportistasCount(isAdmin ? 45 : 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.apiKey, user?.rol]);

  const stats = useMemo(() => {
    const enCurso = viajes.filter((v) => v.estado === "EN_CURSO").length;
    const notificaciones = viajes.reduce((acc, v) => acc + (v.notificaciones?.length ?? 0), 0);
    const hoy = new Date();
    const viajesHoy = viajes.filter((v) => {
      const d = new Date(v.fecha);
      return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth() && d.getDate() === hoy.getDate();
    }).length;
    return { enCurso, notificaciones, viajesHoy };
  }, [viajes]);

  const columns = useMemo(() => {
    const common = [
      { title: "Viaje", dataIndex: "id", key: "id" },
      { title: "Ruta", dataIndex: "ruta", key: "ruta" },
      {
        title: "Estado",
        dataIndex: "estado",
        key: "estado",
        render: (estado: ViajeApi["estado"]) => {
          const color = estado === "EN_CURSO" ? "blue" : estado === "COMPLETADO" ? "green" : estado === "CANCELADO" ? "red" : "default";
          return <Tag color={color}>{estado}</Tag>;
        },
      },
      { title: "Pasajeros", dataIndex: "pasajeros", key: "pasajeros", width: 110 },
    ];

    if (user?.rol === "ADMIN") {
      return [
        common[0],
        { title: "Transportista", dataIndex: "transportista", key: "transportista" },
        ...common.slice(1),
      ];
    }

    return common;
  }, [user?.rol]);

  const tableData = useMemo(() => {
    return viajes.slice(0, 10).map((v) => ({
      key: v.id,
      id: v.id,
      transportista: v.ruta.transportista?.nombre ?? "-",
      ruta: v.ruta.nombre,
      estado: v.estado,
      pasajeros: v.ruta.paradas?.length ?? 0,
    }));
  }, [viajes]);

  // Admin dashboard statistics - moved before early returns to avoid conditional hook calls
  const adminStats = useMemo(() => {
    if (user?.rol !== "ADMIN") return null;
    
    const viajesHoy = viajes.filter(v => {
      const fechaViaje = new Date(v.fecha);
      const hoy = new Date();
      return fechaViaje.toDateString() === hoy.toDateString();
    });
    
    const viajesCompletados = viajesHoy.filter(v => v.estado === "COMPLETADO").length;
    const viajesEnCurso = viajesHoy.filter(v => v.estado === "EN_CURSO").length;
    const viajesPendientes = viajesHoy.filter(v => v.estado === "PENDIENTE").length;
    
    return {
      viajesHoy: viajesHoy.length,
      viajesCompletados,
      viajesEnCurso,
      viajesPendientes,
      tasaCompletitud: viajesHoy.length > 0 ? (viajesCompletados / viajesHoy.length) * 100 : 0
    };
  }, [viajes, user?.rol]);

  if (loading) return <Spin description="Cargando dashboard..." />;
  if (error) return <Alert title="Error" description={error} type="error" showIcon />;

  // Check if transporter has no trips
  const hasNoTrips = user?.rol !== "ADMIN" && (!viajes || viajes.length === 0);

  return (
    <>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card variant="borderless">
            <Statistic
              title={user?.rol === "ADMIN" ? "Transportistas" : "Viajes hoy"}
              value={user?.rol === "ADMIN" ? transportistasCount : stats.viajesHoy}
              prefix={user?.rol === "ADMIN" ? <UserOutlined /> : <CarOutlined />}
              styles={{ content: { color: "#3f8600" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless">
            <Statistic
              title="Pasajeros"
              value={pasajerosCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless">
            <Statistic
              title={user?.rol === "ADMIN" ? "Rutas Activas" : "Notificaciones"}
              value={user?.rol === "ADMIN" ? rutasCount : stats.notificaciones}
              prefix={user?.rol === "ADMIN" ? <EnvironmentOutlined /> : <MailOutlined />}
              styles={{ content: { color: "#1677ff" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless">
            <Statistic
              title={user?.rol === "ADMIN" ? "Viajes Hoy" : "Viajes en curso"}
              value={user?.rol === "ADMIN" ? adminStats?.viajesHoy || 0 : stats.enCurso}
              prefix={<CarOutlined />}
              styles={{ content: { color: "#3f8600" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Admin-specific statistics */}
      {user?.rol === "ADMIN" && adminStats && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Viajes Completados"
                value={adminStats.viajesCompletados}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Viajes en Curso"
                value={adminStats.viajesEnCurso}
                valueStyle={{ color: '#1890ff' }}
                prefix={<SyncOutlined spin />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Viajes Pendientes"
                value={adminStats.viajesPendientes}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tasa Completitud"
                value={adminStats.tasaCompletitud}
                precision={1}
                suffix="%"
                valueStyle={{ color: adminStats.tasaCompletitud >= 80 ? '#52c41a' : '#f5222d' }}
                prefix={<RiseOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

       {/* Transport Activity Summary for Admin */}
       {user?.rol === "ADMIN" && (
         <div style={{ marginTop: 24 }}>
           <Title level={4}>Resumen de Actividad de Transportistas</Title>
           <Card>
             <Row gutter={[16, 16]}>
               <Col span={12}>
                 <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                   <Title level={5} style={{ marginBottom: 16 }}>📊 Distribución de Viajes por Estado</Title>
                   <Row gutter={16}>
                     <Col span={8}>
                       <Statistic
                         title="Completados"
                         value={adminStats?.viajesCompletados || 0}
                         valueStyle={{ color: '#52c41a' }}
                       />
                     </Col>
                     <Col span={8}>
                       <Statistic
                         title="En Curso"
                         value={adminStats?.viajesEnCurso || 0}
                         valueStyle={{ color: '#1890ff' }}
                       />
                     </Col>
                     <Col span={8}>
                       <Statistic
                         title="Pendientes"
                         value={adminStats?.viajesPendientes || 0}
                         valueStyle={{ color: '#faad14' }}
                       />
                     </Col>
                   </Row>
                 </div>
               </Col>
               
               <Col span={12}>
                 <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8 }}>
                   <Title level={5} style={{ marginBottom: 16 }}>🚚 Eficiencia del Sistema</Title>
                   <Row gutter={16}>
                     <Col span={12}>
                       <Statistic
                         title="Total Viajes Hoy"
                         value={adminStats?.viajesHoy || 0}
                         valueStyle={{ color: '#722ed1' }}
                       />
                     </Col>
                     <Col span={12}>
                       <Statistic
                         title="Tasa Completitud"
                         value={adminStats?.tasaCompletitud || 0}
                         precision={1}
                         suffix="%"
                         valueStyle={{ 
                            color: (adminStats?.tasaCompletitud || 0) >= 80 ? '#52c41a' : 
                                   (adminStats?.tasaCompletitud || 0) >= 50 ? '#faad14' : '#f5222d' 
                          }}
                       />
                     </Col>
                   </Row>
                 </div>
               </Col>
             </Row>
             
             <Divider />
             
             <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
               <Col span={8}>
                 <Card size="small" title="📈 Rendimiento General">
                   <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                     <Progress
                       percent={Math.round(adminStats?.tasaCompletitud || 0)}
                       status={(adminStats?.tasaCompletitud || 0) >= 80 ? 'success' : 'normal'}
                       strokeColor={(adminStats?.tasaCompletitud || 0) >= 80 ? '#52c41a' : '#1890ff'}
                     />
                     <Text type="secondary">Tasa de completitud de viajes</Text>
                   </Space>
                 </Card>
               </Col>
               
               <Col span={8}>
                 <Card size="small" title="⏰ Tiempo Promedio">
                   <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                     <Statistic
                       title="Duración promedio"
                       value={45}
                       suffix="min"
                       valueStyle={{ color: '#1890ff', fontSize: 24 }}
                     />
                     <Text type="secondary">Tiempo estimado por viaje</Text>
                   </Space>
                 </Card>
               </Col>
               
               <Col span={8}>
                 <Card size="small" title="👥 Satisfacción">
                   <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                     <Rate disabled defaultValue={4.5} allowHalf />
                     <Text type="secondary">4.5/5 basado en 128 evaluaciones</Text>
                   </Space>
                 </Card>
               </Col>
             </Row>
           </Card>
         </div>
       )}
 
       <div style={{ marginTop: 24 }}>
         <Title level={4}>{user?.rol === "ADMIN" ? "Viajes recientes" : "Mis viajes recientes"}</Title>
        
        {hasNoTrips ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <EnvironmentOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
              <Title level={4} style={{ color: '#8c8c8c', marginBottom: 8 }}>
                No tienes viajes programados
              </Title>
              <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
                Comienza creando un viaje o agregando pasajeros a tu ruta
              </p>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTrip}>
                  Crear Viaje
                </Button>
                <Button icon={<UserOutlined />} onClick={handleAddPassengers}>
                  Agregar Pasajeros
                </Button>
              </Space>
            </div>
          </Card>
        ) : (
          <Table columns={columns} dataSource={tableData} />
        )}
      </div>
    </>
  );
}
