"use client";

import React from "react";
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
} from "antd";
import {
  SaveOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  BellOutlined,
  ApiOutlined,
  MobileOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;
const { Option } = Select;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const onFinish = (values: Record<string, unknown>) => {
    console.log("Settings updated:", values);
    notification.success({
      message: "Configuración guardada",
      description: "Los cambios se han aplicado correctamente.",
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
            <Input placeholder="Ej: RutaSegura Admin" />
          </Form.Item>
          <Form.Item name="timezone" label="Zona horaria">
            <Select>
              <Option value="GMT-3">GMT-3 (Santiago)</Option>
              <Option value="GMT-4">GMT-4 (Punta Arenas)</Option>
              <Option value="UTC">UTC</Option>
            </Select>
          </Form.Item>
          <Form.Item name="language" label="Idioma">
            <Select>
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
          <Divider orientation="left">Alertas automáticas</Divider>
          <Space orientation="vertical" style={{ width: "100%", marginBottom: 24 }} size="middle">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong>Proximidad (1 minuto)</Text>
                <br />
                <Text type="secondary">Avisar cuando el transporte esté a ~1 min del domicilio.</Text>
              </div>
              <Switch defaultChecked />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong>Llegada en puerta</Text>
                <br />
                <Text type="secondary">Avisar cuando el transporte haya llegado al domicilio.</Text>
              </div>
              <Switch defaultChecked />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong>Llegada a destino</Text>
                <br />
                <Text type="secondary">Avisar cuando el pasajero llegue al destino (colegio, trabajo).</Text>
              </div>
              <Switch defaultChecked />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Text strong>WhatsApp como canal preferente</Text>
                <br />
                <Text type="secondary">Usar WhatsApp cuando esté disponible para el contacto.</Text>
              </div>
              <Switch />
            </div>
          </Space>
          <Form onFinish={onFinish}>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Guardar cambios
              </Button>
            </Form.Item>
          </Form>
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
          <Divider orientation="left">Tracking GPS</Divider>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="gpsInterval"
              label="Intervalo de actualización GPS (segundos)"
              initialValue="10"
            >
              <Select>
                <Option value="5">5 segundos (máxima precisión)</Option>
                <Option value="10">10 segundos (recomendado)</Option>
                <Option value="30">30 segundos (ahorro batería)</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Guardar cambios
              </Button>
            </Form.Item>
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
            Claves y configuraciones para servicios externos (maqueta).
          </Text>
          <Form layout="vertical">
            <Form.Item label="Google Maps API Key">
              <Input.Password placeholder="••••••••••••••••" disabled />
            </Form.Item>
            <Form.Item label="Twilio (SMS / WhatsApp)">
              <Row gutter={8}>
                <Col span={12}>
                  <Input placeholder="Account SID" disabled />
                </Col>
                <Col span={12}>
                  <Input.Password placeholder="Auth Token" disabled />
                </Col>
              </Row>
            </Form.Item>
            <Form.Item label="Firebase (FCM - Push)">
              <Input.Password placeholder="Server key o credenciales" disabled />
            </Form.Item>
            <Button type="primary" icon={<SaveOutlined />} disabled>
              Guardar (solo lectura en maqueta)
            </Button>
          </Form>
        </>
      ),
    },
  ];

  return (
    <MainLayout>
      <Title level={2}>Configuración del sistema</Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        Ajustes generales, notificaciones, seguridad e integraciones.
      </Text>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </MainLayout>
  );
}
