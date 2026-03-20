"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, Typography, Space, Divider, notification, InputNumber, Row, Col, Spin, Alert } from "antd";
import { UserOutlined, PhoneOutlined, HomeOutlined, AimOutlined, PlusOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";

const { Title } = Typography;

// TODO: Mover a un contexto de autenticación
const API_KEY = "tu_api_key_aqui";

interface EditarPasajeroFormProps {
  pasajeroId: string;
}

export default function EditarPasajeroForm({ pasajeroId }: EditarPasajeroFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPasajero = async () => {
      try {
        const response = await fetch(`/api/v1/pasajeros/${pasajeroId}`, {
          headers: { "X-API-Key": API_KEY },
        });

        if (!response.ok) throw new Error("No se pudo cargar la información del pasajero");

        const data = await response.json();
        
        // Formatear datos para el formulario
        form.setFieldsValue({
          ...data,
          contactos: data.contactos.map((c: { nombre: string; telefono: string; canal: string }) => ({
            nombre: c.nombre,
            telefono: c.telefono,
            canal: c.canal,
          })),
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocurrió un error desconocido");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPasajero();
  }, [pasajeroId, form]);

  const onFinish = async (values: unknown) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/pasajeros/${pasajeroId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData.error) 
          ? errorData.error[0]?.message 
          : errorData.error || "Error al actualizar el pasajero";
        throw new Error(errorMessage);
      }

      notification.success({
        message: "Pasajero Actualizado",
        description: "La información ha sido guardada exitosamente.",
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

  if (loading) return <Spin tip="Cargando pasajero..." />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <Card>
      <Title level={4}>Editar Información del Pasajero</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        
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
            Guardar Cambios
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
