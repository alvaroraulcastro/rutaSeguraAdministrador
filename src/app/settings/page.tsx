"use client";

import React from "react";
import { Form, Input, Button, Card, Typography, Switch, Select, Divider, Space, notification } from "antd";
import { SaveOutlined, SecurityScanOutlined, GlobalOutlined, BellOutlined } from "@ant-design/icons";
import MainLayout from "@/components/MainLayout";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function SettingsPage() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log("Settings updated:", values);
    notification.success({
      message: "Configuración Guardada",
      description: "Los cambios han sido aplicados correctamente.",
    });
  };

  return (
    <MainLayout>
      <Title level={2}>Configuración del Sistema</Title>
      
      <div style={{ maxWidth: 800 }}>
        <Card title={<span><GlobalOutlined /> General</span>}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              siteName: "RutaSegura Chile",
              timezone: "GMT-3 (Santiago)",
              language: "es",
            }}
            onFinish={onFinish}
          >
            <Form.Item name="siteName" label="Nombre del Sitio">
              <Input placeholder="Ej: RutaSegura Admin" />
            </Form.Item>
            
            <Form.Item name="timezone" label="Zona Horaria">
              <Select>
                <Option value="GMT-3 (Santiago)">GMT-3 (Santiago)</Option>
                <Option value="UTC">UTC</Option>
              </Select>
            </Form.Item>

            <Divider orientation="left"><BellOutlined /> Notificaciones Automáticas</Divider>
            
            <Space direction="vertical" style={{ width: "100%", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text>Habilitar Notificaciones de proximidad (1 min)</Text>
                <Switch defaultChecked />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text>Habilitar Notificaciones de llegada al destino</Text>
                <Switch defaultChecked />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text>Usar WhatsApp como canal preferente</Text>
                <Switch />
              </div>
            </Space>

            <Divider orientation="left"><SecurityScanOutlined /> Seguridad</Divider>
            
            <Form.Item label="Intervalo de actualización GPS (segundos)">
              <Select defaultValue="10">
                <Option value="5">5 segundos</Option>
                <Option value="10">10 segundos</Option>
                <Option value="30">30 segundos</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Guardar Cambios
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}
