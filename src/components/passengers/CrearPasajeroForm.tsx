"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, Space, Divider, notification, Row, Col, InputNumber } from "antd";
import { UserOutlined, PhoneOutlined, HomeOutlined, AimOutlined, PlusOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title } = Typography;

export default function CrearPasajeroForm() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: unknown) => {
    if (!user?.apiKey) {
      notification.error({
        message: "No autenticado",
        description: "Inicia sesión para realizar esta acción.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/pasajeros"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": user.apiKey,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData.error) 
          ? errorData.error[0]?.message 
          : errorData.error || "Error al crear el pasajero";
        throw new Error(errorMessage);
      }

      notification.success({
        message: "Pasajero Creado",
        description: "El pasajero ha sido registrado exitosamente.",
      });
      router.push("/passengers");
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({
          message: "Error",
          description: err.message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <Title level={4}>Registrar Nuevo Pasajero</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ contactos: [{ canal: 'PUSH' }] }}>
        
        <Divider titlePlacement="left"><UserOutlined /> Información Personal</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="nombre" label="Nombre Completo" rules={[{ required: true }]}>
              <Input placeholder="Ej: Juan Soto" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="telefono" label="Teléfono" rules={[{ required: true }]}>
              <Input prefix={<PhoneOutlined />} placeholder="+56 9 ..." />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left"><HomeOutlined /> Domicilio (Origen)</Divider>
        <Form.Item name="direccionDomicilio" label="Dirección de Recogida" rules={[{ required: true }]}>
          <Input placeholder="Calle, Número, Comuna" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="numeroDepto" label="Depto/Casa">
              <Input placeholder="Ej: 204" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="latDomicilio" label="Latitud" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="lngDomicilio" label="Longitud" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left"><AimOutlined /> Destino</Divider>
        <Form.Item name="nombreDestino" label="Nombre del Destino (Colegio/Empresa)" rules={[{ required: true }]}>
          <Input placeholder="Ej: Colegio Saint George" />
        </Form.Item>
        <Form.Item name="direccionDestino" label="Dirección de Destino" rules={[{ required: true }]}>
          <Input placeholder="Calle, Número, Comuna" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="latDestino" label="Latitud" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lngDestino" label="Longitud" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left"><TeamOutlined /> Contactos de Notificación</Divider>
        <Form.List name="contactos">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'nombre']}
                    rules={[{ required: true, message: 'Falta nombre' }]}
                  >
                    <Input placeholder="Nombre contacto" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'telefono']}
                    rules={[{ required: true, message: 'Falta teléfono' }]}
                  >
                    <Input placeholder="Teléfono" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'canal']}
                  >
                    <Input disabled defaultValue="PUSH" />
                  </Form.Item>
                  <DeleteOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Añadir Contacto
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} block size="large">
            Registrar Pasajero
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
