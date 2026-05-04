"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { Form, Input, Button, Select, Card, Typography, Spin, notification, Alert, Divider, Row, Col, Space, InputNumber } from "antd";
import { EnvironmentOutlined, AimOutlined } from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title } = Typography;
const { Option } = Select;

interface EditarRutaFormProps {
  id: string;
}

type TipoInicioRuta = "DOMICILIO_TRANSPORTISTA" | "VEHICULO";
type LatLng = { lat: number; lng: number };

const LeafletPointMap = dynamic(async () => {
  const { MapContainer, TileLayer, CircleMarker } = await import("react-leaflet");

  return function LeafletPointMapInner({ marker }: { marker: [number, number] }) {
    return (
      <MapContainer center={marker} zoom={16} scrollWheelZoom={false} style={{ height: 260, width: "100%", borderRadius: 8 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker center={marker} radius={10} pathOptions={{ color: "#1677ff" }} />
      </MapContainer>
    );
  };
}, { ssr: false });

async function geocode(query: string): Promise<LatLng | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("No se pudo consultar el geocodificador");
  const data: Array<{ lat: string; lon: string }> = await response.json();
  const first = data[0];
  if (!first) return null;
  return { lat: Number(first.lat), lng: Number(first.lon) };
}

export default function EditarRutaForm({ id }: EditarRutaFormProps) {
  const { user, logout } = useAuth();
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [inicioCoords, setInicioCoords] = useState<LatLng | null>(null);
  const [searchingInicio, setSearchingInicio] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.apiKey) return;
      try {
        if (user.rol !== "TRANSPORTISTA") {
          setLoading(false);
          return;
        }

        const rutaRes = await fetch(getApiUrl(`/api/v1/rutas/${id}`), { headers: { "X-API-Key": user.apiKey } });
        if (rutaRes.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        if (!rutaRes.ok) throw new Error("Error al cargar datos");

        const rutaData = await rutaRes.json();
        form.setFieldsValue({
          nombre: rutaData.nombre,
          tipo: rutaData.tipo,
          inicioTipo: rutaData.inicioTipo ?? "VEHICULO",
          inicioDireccion: rutaData.inicioDireccion ?? "",
          inicioComuna: rutaData.inicioComuna ?? "",
          latInicio: rutaData.latInicio ?? undefined,
          lngInicio: rutaData.lngInicio ?? undefined,
        });
        if (typeof rutaData.latInicio === "number" && typeof rutaData.lngInicio === "number") {
          setInicioCoords({ lat: rutaData.latInicio, lng: rutaData.lngInicio });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error al cargar datos";
        notification.error({ message: "Error", description: message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form, user?.apiKey, user?.rol, logout, router]);

  const onFinish = async (values: {
    nombre: string;
    tipo?: "IDA" | "VUELTA" | "IDA_Y_VUELTA";
    inicioTipo?: TipoInicioRuta;
    inicioDireccion?: string;
    inicioComuna?: string;
    latInicio?: number;
    lngInicio?: number;
  }) => {
    if (!user?.apiKey) return;
    try {
      if (user.rol !== "TRANSPORTISTA") {
        notification.error({ message: "No autorizado" });
        return;
      }

      setSubmitting(true);
      const response = await fetch(getApiUrl(`/api/v1/rutas/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": user.apiKey,
        },
        body: JSON.stringify(values),
      });

      if (response.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error("Error al actualizar la ruta");

      notification.success({ message: "Ruta actualizada correctamente" });
      router.push("/routes");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al actualizar la ruta";
      notification.error({ message: "Error", description: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin description="Cargando datos de la ruta..." />;
  }

  if (user?.rol !== "TRANSPORTISTA") {
    return (
      <Card>
        <Title level={4}>Editar Ruta</Title>
        <Alert
          type="info"
          showIcon
          message="Solo los transportistas pueden editar rutas"
          description="Un usuario ADMIN puede visualizar rutas, pero no editarlas."
        />
      </Card>
    );
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
        <Form.Item name="tipo" label="Tipo de Ruta">
          <Select placeholder="Selecciona un tipo (opcional)">
            <Option value="IDA">IDA</Option>
            <Option value="VUELTA">VUELTA</Option>
            <Option value="IDA_Y_VUELTA">IDA Y VUELTA</Option>
          </Select>
        </Form.Item>

        <Divider>Inicio de la Ruta</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="inicioTipo" label="Origen del inicio" rules={[{ required: true }]}>
              <Select>
                <Option value="VEHICULO">Ubicación del vehículo</Option>
                <Option value="DOMICILIO_TRANSPORTISTA">Domicilio del transportista</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="inicioDireccion" label="Dirección de inicio" rules={[{ required: true }]}>
              <Input placeholder="Ej: Av. Apoquindo 3000" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="inicioComuna" label="Comuna de inicio" rules={[{ required: true }]}>
              <Input placeholder="Ej: Las Condes" />
            </Form.Item>
          </Col>
        </Row>
        <Space style={{ marginBottom: 12 }}>
          <Button
            icon={<AimOutlined />}
            loading={searchingInicio}
            onClick={async () => {
              const inicioDireccion = form.getFieldValue("inicioDireccion");
              const inicioComuna = form.getFieldValue("inicioComuna");
              const query = `${inicioDireccion}, ${inicioComuna}, Chile`.trim();
              if (!inicioDireccion?.trim() || !inicioComuna?.trim()) {
                notification.warning({ message: "Completa dirección y comuna del inicio" });
                return;
              }
              setSearchingInicio(true);
              try {
                const coords = await geocode(query);
                if (!coords) {
                  notification.error({ message: "No se encontró la ubicación de inicio" });
                  return;
                }
                setInicioCoords(coords);
                form.setFieldsValue({ latInicio: coords.lat, lngInicio: coords.lng });
              } catch (err: unknown) {
                notification.error({
                  message: "Error al buscar inicio",
                  description: err instanceof Error ? err.message : "Error desconocido",
                });
              } finally {
                setSearchingInicio(false);
              }
            }}
          >
            Buscar en mapa
          </Button>
        </Space>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="latInicio" label="Latitud (inicio)" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} placeholder="-33.44" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lngInicio" label="Longitud (inicio)" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} placeholder="-70.65" />
            </Form.Item>
          </Col>
        </Row>
        {inicioCoords ? (
          <div style={{ marginBottom: 16 }}>
            <LeafletPointMap marker={[inicioCoords.lat, inicioCoords.lng]} />
          </div>
        ) : null}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Guardar Cambios
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
