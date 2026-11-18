"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { Form, Input, Button, Card, Typography, Space, Divider, notification, InputNumber, Row, Col, Spin, Alert } from "antd";
import { UserOutlined, PhoneOutlined, HomeOutlined, AimOutlined, PlusOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title } = Typography;

interface EditarPasajeroFormProps {
  id: string;
}

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

function splitDireccionComuna(raw: string | null | undefined): { direccion: string; comuna: string } {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return { direccion: "", comuna: "" };

  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return { direccion: value, comuna: "" };

  const comuna = parts[parts.length - 1] ?? "";
  const direccion = parts.slice(0, -1).join(", ");
  return { direccion, comuna };
}

async function geocode(query: string): Promise<LatLng | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("No se pudo consultar el geocodificador");
  const data: Array<{ lat: string; lon: string }> = await response.json();
  const first = data[0];
  if (!first) return null;
  return { lat: Number(first.lat), lng: Number(first.lon) };
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  return undefined;
}

export default function EditarPasajeroForm({ id }: EditarPasajeroFormProps) {
  const { user, logout } = useAuth();
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domicilioCoords, setDomicilioCoords] = useState<LatLng | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<LatLng | null>(null);
  const [searchingDomicilio, setSearchingDomicilio] = useState(false);
  const [searchingDestino, setSearchingDestino] = useState(false);

  useEffect(() => {
    const fetchPasajero = async () => {
      if (!user?.apiKey) return;
      try {
        const response = await fetch(getApiUrl(`/api/v1/pasajeros/${id}`), {
          headers: { "X-API-Key": user.apiKey },
        });

        if (response.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("No se pudo cargar la información del pasajero");

        const data = await response.json();

        const domicilio = splitDireccionComuna(data?.direccionDomicilio);
        const destino = splitDireccionComuna(data?.direccionDestino);

        form.setFieldsValue({
          nombre: data?.nombre ?? undefined,
          telefono: data?.telefono ?? undefined,
          foto: data?.foto ?? undefined,
          numeroDepto: data?.numeroDepto ?? undefined,
          instruccionesDomicilio: data?.instruccionesDomicilio ?? undefined,
          nombreDestino: data?.nombreDestino ?? undefined,
          latDomicilio: data?.latDomicilio ?? undefined,
          lngDomicilio: data?.lngDomicilio ?? undefined,
          latDestino: data?.latDestino ?? undefined,
          lngDestino: data?.lngDestino ?? undefined,
          domicilioDireccion: domicilio.direccion,
          domicilioComuna: domicilio.comuna,
          destinoDireccion: destino.direccion,
          destinoComuna: destino.comuna,
          contactos: (data?.contactos ?? []).map(
            (c: { nombre: string; telefono: string; canal: string; email?: string | null }) => ({
              nombre: c.nombre,
              telefono: c.telefono,
              canal: c.canal,
              email: c.email ?? undefined,
            })
          ),
        });

        if (typeof data?.latDomicilio === "number" && typeof data?.lngDomicilio === "number") {
          setDomicilioCoords({ lat: data.latDomicilio, lng: data.lngDomicilio });
        }
        if (typeof data?.latDestino === "number" && typeof data?.lngDestino === "number") {
          setDestinoCoords({ lat: data.latDestino, lng: data.lngDestino });
        }
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
  }, [id, form, user?.apiKey, logout, router]);

  const onFinish = async (values: PasajeroFormValues) => {
    if (!user?.apiKey) return;
    setSubmitting(true);
    try {
      const domicilioDireccion = values.domicilioDireccion?.trim();
      const domicilioComuna = values.domicilioComuna?.trim();
      const destinoDireccion = values.destinoDireccion?.trim();
      const destinoComuna = values.destinoComuna?.trim();

      const direccionDomicilio = `${domicilioDireccion}, ${domicilioComuna}`.trim();
      const direccionDestino = `${destinoDireccion}, ${destinoComuna}`.trim();

      const latDomicilio = asNumber(values.latDomicilio);
      const lngDomicilio = asNumber(values.lngDomicilio);
      const latDestino = asNumber(values.latDestino);
      const lngDestino = asNumber(values.lngDestino);

      const contactos = values.contactos?.map((c) => ({
        ...c,
        canal: c.canal?.trim() ? c.canal : "PUSH",
        email: asOptionalString(c.email),
      }));

      const payload = {
        nombre: values.nombre,
        telefono: values.telefono,
        foto: asOptionalString(values.foto),
        direccionDomicilio,
        numeroDepto: asOptionalString(values.numeroDepto),
        latDomicilio,
        lngDomicilio,
        instruccionesDomicilio: asOptionalString(values.instruccionesDomicilio),
        nombreDestino: values.nombreDestino,
        direccionDestino,
        latDestino,
        lngDestino,
        contactos,
      };

      const response = await fetch(getApiUrl(`/api/v1/pasajeros/${id}`), {
        method: "PUT",
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

  const handleValuesChange = (changedValues: Partial<PasajeroFormValues>) => {
    if (typeof changedValues.latDomicilio === "number" || typeof changedValues.lngDomicilio === "number") {
      const lat = form.getFieldValue("latDomicilio");
      const lng = form.getFieldValue("lngDomicilio");
      if (typeof lat === "number" && typeof lng === "number") setDomicilioCoords({ lat, lng });
    }
    if (typeof changedValues.latDestino === "number" || typeof changedValues.lngDestino === "number") {
      const lat = form.getFieldValue("latDestino");
      const lng = form.getFieldValue("lngDestino");
      if (typeof lat === "number" && typeof lng === "number") setDestinoCoords({ lat, lng });
    }
  };

  return (
    <Card>
      <Title level={4}>Editar Información del Pasajero</Title>
      {error ? (
        <Alert style={{ marginBottom: 16 }} title="Error" description={error} type="error" showIcon />
      ) : null}
      <Spin spinning={loading} tip="Cargando pasajero...">
        <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={handleValuesChange}>
        
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
                    initialValue="PUSH"
                  >
                    <Input disabled />
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
      </Spin>
    </Card>
  );
}
