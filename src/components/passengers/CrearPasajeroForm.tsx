"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { Form, Input, Button, Card, Typography, Space, Divider, notification, Row, Col, InputNumber } from "antd";
import { UserOutlined, PhoneOutlined, HomeOutlined, AimOutlined, PlusOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title } = Typography;

type LatLng = { lat: number; lng: number };

type PasajeroFormValues = {
  nombre: string;
  telefono: string;
  foto?: string;
  numeroDepto?: string;
  instruccionesDomicilio?: string;
  nombreDestino: string;
  latDomicilio: number;
  lngDomicilio: number;
  latDestino: number;
  lngDestino: number;
  contactos?: { nombre: string; telefono: string; canal?: string; email?: string }[];
  domicilioDireccion: string;
  domicilioComuna: string;
  destinoDireccion: string;
  destinoComuna: string;
};

const LeafletMap = dynamic(async () => {
  const { MapContainer, TileLayer, CircleMarker } = await import("react-leaflet");

  return function LeafletMapInner({
    center,
    marker,
  }: {
    center: [number, number];
    marker: [number, number];
  }) {
    return (
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: 260, width: "100%", borderRadius: 8 }}
      >
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

export default function CrearPasajeroForm() {
  const { user, logout } = useAuth();
  const [form] = Form.useForm();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [domicilioCoords, setDomicilioCoords] = useState<LatLng | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<LatLng | null>(null);
  const [searchingDomicilio, setSearchingDomicilio] = useState(false);
  const [searchingDestino, setSearchingDestino] = useState(false);

  const onFinish = async (values: PasajeroFormValues) => {
    if (!user?.apiKey) {
      notification.error({
        message: "No autenticado",
        description: "Inicia sesión para realizar esta acción.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const direccionDomicilio = `${values.domicilioDireccion}, ${values.domicilioComuna}`.trim();
      const direccionDestino = `${values.destinoDireccion}, ${values.destinoComuna}`.trim();

      const payload = {
        nombre: values.nombre,
        telefono: values.telefono,
        foto: values.foto,
        direccionDomicilio,
        numeroDepto: values.numeroDepto,
        latDomicilio: values.latDomicilio,
        lngDomicilio: values.lngDomicilio,
        instruccionesDomicilio: values.instruccionesDomicilio,
        nombreDestino: values.nombreDestino,
        direccionDestino,
        latDestino: values.latDestino,
        lngDestino: values.lngDestino,
        contactos: values.contactos,
      };

      const response = await fetch(getApiUrl("/api/v1/pasajeros"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": user.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
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

  const handleBuscarDomicilio = async () => {
    const domicilioDireccion = form.getFieldValue("domicilioDireccion");
    const domicilioComuna = form.getFieldValue("domicilioComuna");

    const query = `${domicilioDireccion}, ${domicilioComuna}, Chile`.trim();
    if (!domicilioDireccion?.trim() || !domicilioComuna?.trim()) {
      notification.warning({ message: "Completa dirección y comuna del domicilio" });
      return;
    }

    setSearchingDomicilio(true);
    try {
      const coords = await geocode(query);
      if (!coords) {
        notification.error({ message: "No se encontró la ubicación del domicilio" });
        return;
      }
      setDomicilioCoords(coords);
      form.setFieldsValue({ latDomicilio: coords.lat, lngDomicilio: coords.lng });
    } catch (error: unknown) {
      notification.error({
        message: "Error al buscar domicilio",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setSearchingDomicilio(false);
    }
  };

  const handleBuscarDestino = async () => {
    const destinoDireccion = form.getFieldValue("destinoDireccion");
    const destinoComuna = form.getFieldValue("destinoComuna");

    const query = `${destinoDireccion}, ${destinoComuna}, Chile`.trim();
    if (!destinoDireccion?.trim() || !destinoComuna?.trim()) {
      notification.warning({ message: "Completa dirección y comuna del destino" });
      return;
    }

    setSearchingDestino(true);
    try {
      const coords = await geocode(query);
      if (!coords) {
        notification.error({ message: "No se encontró la ubicación del destino" });
        return;
      }
      setDestinoCoords(coords);
      form.setFieldsValue({ latDestino: coords.lat, lngDestino: coords.lng });
    } catch (error: unknown) {
      notification.error({
        message: "Error al buscar destino",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setSearchingDestino(false);
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
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="domicilioDireccion" label="Dirección" rules={[{ required: true }]}>
              <Input placeholder="Calle y número" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="domicilioComuna" label="Comuna" rules={[{ required: true }]}>
              <Input placeholder="Ej: Providencia" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ marginBottom: 16 }}>
          <Button htmlType="button" onClick={handleBuscarDomicilio} loading={searchingDomicilio}>
            Buscar en mapa (domicilio)
          </Button>
        </Form.Item>
        {domicilioCoords ? (
          <div style={{ marginBottom: 16 }}>
            <LeafletMap
              center={[domicilioCoords.lat, domicilioCoords.lng]}
              marker={[domicilioCoords.lat, domicilioCoords.lng]}
            />
          </div>
        ) : null}
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
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="destinoDireccion" label="Dirección" rules={[{ required: true }]}>
              <Input placeholder="Calle y número" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="destinoComuna" label="Comuna" rules={[{ required: true }]}>
              <Input placeholder="Ej: Las Condes" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ marginBottom: 16 }}>
          <Button htmlType="button" onClick={handleBuscarDestino} loading={searchingDestino}>
            Buscar en mapa (destino)
          </Button>
        </Form.Item>
        {destinoCoords ? (
          <div style={{ marginBottom: 16 }}>
            <LeafletMap
              center={[destinoCoords.lat, destinoCoords.lng]}
              marker={[destinoCoords.lat, destinoCoords.lng]}
            />
          </div>
        ) : null}
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
