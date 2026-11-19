"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Switch,
  Select,
  Divider,
  Space,
  notification,
  Row,
  Col,
  Tabs,
  Alert,
  Spin,
} from "antd";
import {
  SaveOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  BellOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Text } = Typography;
const { Option } = Select;

interface ConfigOperativa {
  gps: { enCaminoMetros: number; enPuertaMetros: number; ubicacionIntervaloMinimoSegundos: number };
  notificaciones: { fcmConfigurado: boolean };
}

export default function SettingsClient() {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const [operativa, setOperativa] = useState<ConfigOperativa | null>(null);
  const [cargandoOperativa, setCargandoOperativa] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.apiKey) return;
      try {
        const res = await fetch(getApiUrl("/api/v1/config/operativa"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (res.ok) setOperativa(await res.json());
      } finally {
        setCargandoOperativa(false);
      }
    };
    void load();
  }, [user?.apiKey]);

  const onFinish = (values: Record<string, unknown>) => {
    console.log("Settings updated:", values);
    notification.success({
      message: "Preferencias guardadas en esta sesión",
      description:
        "Los umbrales GPS y FCM se configuran con variables de entorno en el servidor (ver documentación).",
    });
  };

  const tabItems = [
    {
      key: "general",
      label: (
        <span>
          <GlobalOutlined /> General
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            siteName: "RutaSegura Chile",
            timezone: "GMT-3",
            language: "es",
          }}
          onFinish={onFinish}
        >
          <Form.Item name="siteName" label="Nombre del sitio">
            <Input placeholder="Ej: RutaSegura Admin" aria-label="Nombre del sitio" />
          </Form.Item>
          <Form.Item name="timezone" label="Zona horaria">
            <Select aria-label="Zona horaria">
              <Option value="GMT-3">GMT-3 (Santiago)</Option>
              <Option value="GMT-4">GMT-4 (Punta Arenas)</Option>
              <Option value="UTC">UTC</Option>
            </Select>
          </Form.Item>
          <Form.Item name="language" label="Idioma">
            <Select aria-label="Idioma">
              <Option value="es">Español</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Guardar cambios
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "notifications",
      label: (
        <span>
          <BellOutlined /> Notificaciones
        </span>
      ),
      children: (
        <>
          {cargandoOperativa ? (
            <Spin />
          ) : (
            <Alert
              type={operativa?.notificaciones.fcmConfigurado ? "success" : "warning"}
              showIcon
              style={{ marginBottom: 16 }}
              message={
                operativa?.notificaciones.fcmConfigurado
                  ? "FCM_SERVER_KEY configurada en el servidor"
                  : "Sin FCM: las alertas se registran en el panel pero no llegan al dispositivo"
              }
            />
          )}
          <Divider>Alertas automáticas</Divider>
          <Space direction="vertical" style={{ width: "100%", marginBottom: 24 }} size="middle">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong>Proximidad (en camino)</Text>
                <br />
                <Text type="secondary">
                  Umbrales actuales en servidor: {operativa?.gps.enCaminoMetros ?? "—"} m (en camino),{" "}
                  {operativa?.gps.enPuertaMetros ?? "—"} m (en puerta).
                </Text>
              </div>
              <Switch defaultChecked disabled aria-label="Alerta de proximidad" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong>Llegada en puerta</Text>
                <br />
                <Text type="secondary">Variables: GPS_UMBRAL_EN_CAMINO_METROS, GPS_UMBRAL_EN_PUERTA_METROS.</Text>
              </div>
              <Switch defaultChecked disabled aria-label="Alerta de llegada en puerta" />
            </div>
          </Space>
        </>
      ),
    },
    {
      key: "security",
      label: (
        <span>
          <SecurityScanOutlined /> Seguridad y GPS
        </span>
      ),
      children: (
        <>
          <Divider>Tracking GPS</Divider>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Intervalo mínimo entre POST location (servidor)">
              <Text strong>
                {operativa?.gps.ubicacionIntervaloMinimoSegundos ?? 2} segundos (fijo en servidor)
              </Text>
            </Form.Item>
            <Text type="secondary">
              La app transportista debería enviar ubicación cada 10–15 s; el API rechaza ráfagas más rápidas que 2 s por
              viaje.
            </Text>
          </Form>
        </>
      ),
    },
    {
      key: "integrations",
      label: (
        <span>
          <ApiOutlined /> Integraciones
        </span>
      ),
      children: (
        <>
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Claves y configuraciones para servicios externos (solo lectura en panel; editar en Vercel / .env.local).
          </Text>
          <Form layout="vertical">
            <Form.Item label="Google Maps API Key">
              <Input.Password placeholder="No configurada" disabled aria-label="Google Maps API Key" />
            </Form.Item>
            <Form.Item label="Twilio (SMS / WhatsApp)">
              <Row gutter={8}>
                <Col span={12}>
                  <Input placeholder="Account SID" disabled aria-label="Twilio Account SID" />
                </Col>
                <Col span={12}>
                  <Input.Password placeholder="Auth Token" disabled aria-label="Twilio Auth Token" />
                </Col>
              </Row>
            </Form.Item>
            <Form.Item label="Firebase (FCM - Push)">
              <Input.Password
                placeholder={operativa?.notificaciones.fcmConfigurado ? "Configurada en servidor" : "Sin configurar"}
                disabled
                aria-label="Firebase Server Key"
              />
            </Form.Item>
          </Form>
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Preferencias de interfaz y vista de parámetros operativos del servidor."
      />

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </>
  );
}