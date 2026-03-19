"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Select, Card, Typography, Spin, Alert, notification } from "antd";
import { EnvironmentOutlined, CarOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

// TODO: Mover a un contexto de autenticación o variable de entorno
const API_KEY = "tu_api_key_aqui"; // Reemplaza con una API Key válida

interface Transportista {
  id: string;
  nombre: string;
}

interface EditarRutaFormProps {
  rutaId: string;
}

export default function EditarRutaForm({ rutaId }: EditarRutaFormProps) {
  const [form] = Form.useForm();
  const router = useRouter();
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rutaRes, transportistasRes] = await Promise.all([
          fetch(`/api/v1/rutas/${rutaId}`, { headers: { "X-API-Key": API_KEY } }),
          fetch("/api/v1/transportistas", { headers: { "X-API-Key": API_KEY } }),
        ]);

        if (!rutaRes.ok) throw new Error("No se pudo cargar la ruta");
        if (!transportistasRes.ok) throw new Error("No se pudieron cargar los transportistas");

        const rutaData = await rutaRes.json();
        const transportistasData = await transportistasRes.json();

        form.setFieldsValue({
          nombre: rutaData.nombre,
          transportistaId: rutaData.transportistaId,
        });
        setTransportistas(transportistasData);
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
    fetchData();
  }, [rutaId, form]);

  const onFinish = async (values: { nombre: string; transportistaId: string }) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/rutas/${rutaId}`, {
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
          : errorData.error || "Error al actualizar la ruta";
        throw new Error(errorMessage);
      }

      notification.success({
        message: "Ruta Actualizada",
        description: "La ruta ha sido actualizada exitosamente.",
      });
      router.push("/routes");
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

  if (loading) {
    return <Spin tip="Cargando datos de la ruta..." />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <Card>
      <Title level={4}>Editar Ruta</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="nombre"
          label="Nombre de la Ruta"
          rules={[{ required: true, message: "Por favor, ingresa un nombre para la ruta" }]}
        >
          <Input prefix={<EnvironmentOutlined />} placeholder="Ej: Ruta Mañana - Vitacura" />
        </Form.Item>
        <Form.Item
          name="transportistaId"
          label="Transportista Asignado"
          rules={[{ required: true, message: "Por favor, selecciona un transportista" }]}
        >
          <Select placeholder="Selecciona un transportista">
            {transportistas.map((t) => (
              <Option key={t.id} value={t.id}>
                <CarOutlined /> {t.nombre}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Guardar Cambios
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
