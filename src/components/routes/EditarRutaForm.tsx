"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Select, Card, Typography, Spin, Alert, notification } from "antd";
import { EnvironmentOutlined, CarOutlined } from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title } = Typography;
const { Option } = Select;

interface EditarRutaFormProps {
  id: string;
}

export default function EditarRutaForm({ id }: EditarRutaFormProps) {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transportistas, setTransportistas] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.apiKey) return;
      try {
        const [rutaRes, transRes] = await Promise.all([
          fetch(getApiUrl(`/api/v1/rutas/${id}`), { headers: { "X-API-Key": user.apiKey } }),
          fetch(getApiUrl("/api/v1/transportistas"), { headers: { "X-API-Key": user.apiKey } }),
        ]);

        if (!rutaRes.ok || !transRes.ok) throw new Error("Error al cargar datos");

        const rutaData = await rutaRes.json();
        const transData = await transRes.json();

        setTransportistas(transData);
        form.setFieldsValue({
          ...rutaData,
          transportistaId: rutaData.transportistaId || undefined,
        });
      } catch (err: any) {
        notification.error({ message: "Error", description: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form, user?.apiKey]);

  const onFinish = async (values: any) => {
    if (!user?.apiKey) return;
    try {
      setSubmitting(true);
      const response = await fetch(getApiUrl(`/api/v1/rutas/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": user.apiKey,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Error al actualizar la ruta");

      notification.success({ message: "Ruta actualizada correctamente" });
      router.push("/routes");
    } catch (err: any) {
      notification.error({ message: "Error", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin tip="Cargando datos de la ruta..." />;
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
