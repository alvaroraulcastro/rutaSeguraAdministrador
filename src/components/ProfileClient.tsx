"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Space, Divider, notification, Row, Col, Avatar, Table, Tag, Badge, Skeleton, Alert } from "antd";
import { UserOutlined, PhoneOutlined, LockOutlined, SaveOutlined, BellOutlined, EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";
import EmptyState from "@/components/EmptyState";

const { Title, Text } = Typography;

interface NotificacionPerfil {
  id: string;
  mensaje: string;
  tipo: string;
  estado: string;
  destinatario: string | null;
  enviadoEn: string;
  pasajero: { nombre: string };
}

export default function ProfileClient() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionPerfil[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const [errorNotif, setErrorNotif] = useState<string | null>(null);

  const onUpdateProfile = async (values: { nombre?: string; telefono?: string; foto?: string | null }) => {
    setUpdatingProfile(true);
    const result = await updateProfile(values);
    setUpdatingProfile(false);
    
    if (result.ok) {
      notification.success({
        message: "Perfil Actualizado",
        description: "Tus datos han sido guardados correctamente.",
      });
    } else {
      notification.error({
        message: "Error",
        description: result.message,
      });
    }
  };

  const onChangePassword = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(values.currentPassword, values.newPassword);
    setChangingPassword(false);

    if (result.ok) {
      notification.success({
        message: "Contraseña Cambiada",
        description: "Tu contraseña ha sido actualizada con éxito.",
      });
      passwordForm.resetFields();
    } else {
      notification.error({
        message: "Error",
        description: result.message,
      });
    }
  };

  // Fetch last 5 push notifications for TRANSPORTISTA
  useEffect(() => {
    const fetchNotificaciones = async () => {
      if (!user?.apiKey || user.rol !== "TRANSPORTISTA") {
        setLoadingNotif(false);
        return;
      }
      try {
        setLoadingNotif(true);
        const res = await fetch(getApiUrl("/api/v1/notificaciones?limit=5"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (!res.ok) throw new Error("Error al obtener notificaciones");
        const data = await res.json();
        setNotificaciones(data);
      } catch (err: unknown) {
        if (err instanceof Error) setErrorNotif(err.message);
        else setErrorNotif("Ocurrió un error");
      } finally {
        setLoadingNotif(false);
      }
    };
    fetchNotificaciones();
  }, [user?.apiKey, user?.rol]);

  if (!user) return null;

  const statusConfig: Record<string, "success" | "processing" | "error" | "default"> = {
    ENVIADO: "success",
    PROCESANDO: "processing",
    FALLIDO: "error",
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Mi Perfil</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<Space><UserOutlined /> Información Personal</Space>}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar size={100} src={user.foto} icon={<UserOutlined />} />
              <div style={{ marginTop: 8 }}>
                <Text strong>{user.nombre}</Text>
                <br />
                <Text type="secondary">{user.email}</Text>
                <br />
                <Text code>{user.rol}</Text>
              </div>
            </div>
            
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={onUpdateProfile}
              initialValues={{
                nombre: user.nombre,
                telefono: user.telefono || "",
                foto: user.foto || "",
              }}
            >
              <Form.Item name="nombre" label="Nombre Completo" rules={[{ required: true, message: "Ingresa tu nombre" }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              
              <Form.Item name="telefono" label="Teléfono">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              
              <Form.Item name="foto" label="URL de Foto de Perfil">
                <Input placeholder="https://ejemplo.com/foto.jpg" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updatingProfile} block>
                  Guardar Cambios
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<Space><LockOutlined /> Seguridad</Space>}>
            <Text type="secondary">
              Te recomendamos usar una contraseña segura que no utilices en otros sitios.
            </Text>
            <Divider />
            
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onChangePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Contraseña Actual"
                rules={[{ required: true, message: "Ingresa tu contraseña actual" }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="Nueva Contraseña"
                rules={[
                  { required: true, message: "Ingresa tu nueva contraseña" },
                  { min: 6, message: "Mínimo 6 caracteres" }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Confirmar Nueva Contraseña"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: "Confirma tu nueva contraseña" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" danger htmlType="submit" loading={changingPassword} block>
                  Actualizar Contraseña
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Sección de Notificaciones Push — solo para TRANSPORTISTA */}
      {user.rol === "TRANSPORTISTA" && (
        <Card
          title={
            <Space>
              <BellOutlined />
              Historial de Notificaciones Push
            </Space>
          }
          style={{ marginTop: 8 }}
          extra={
            <Link href="/notifications">
              <Button type="link" icon={<EyeOutlined />}>
                Ver historial completo
              </Button>
            </Link>
          }
        >
          {loadingNotif ? (
            <Skeleton active title={false} paragraph={{ rows: 3 }} />
          ) : errorNotif ? (
            <Alert message="Error" description={errorNotif} type="error" showIcon />
          ) : notificaciones.length === 0 ? (
            <EmptyState
              title="Sin notificaciones push"
              description="Aún no tienes notificaciones push registradas para tus rutas."
            />
          ) : (
            <Table
              columns={[
                {
                  title: "Fecha",
                  dataIndex: "enviadoEn",
                  key: "enviadoEn",
                  width: 160,
                  render: (fecha: string) => (
                    <Text>{new Date(fecha).toLocaleString("es-CL")}</Text>
                  ),
                },
                {
                  title: "Pasajero",
                  dataIndex: "pasajero",
                  key: "pasajero",
                  render: (p: { nombre: string }) => <Text strong>{p.nombre}</Text>,
                },
                {
                  title: "Tipo",
                  dataIndex: "tipo",
                  key: "tipo",
                  render: (tipo: string) => <Tag color="blue">{tipo.replace(/_/g, " ")}</Tag>,
                },
                {
                  title: "Mensaje",
                  dataIndex: "mensaje",
                  key: "mensaje",
                  ellipsis: true,
                },
                {
                  title: "Estado",
                  dataIndex: "estado",
                  key: "estado",
                  render: (estado: string) => (
                    <Badge status={statusConfig[estado] ?? "default"} text={estado} />
                  ),
                },
              ]}
              dataSource={notificaciones}
              pagination={false}
              rowKey="id"
              size="small"
            />
          )}
        </Card>
      )}
    </Space>
  );
}
