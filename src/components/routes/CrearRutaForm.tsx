"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { Form, Input, Button, Select, Card, Typography, Spin, Alert, notification, Space, Divider, Row, Col, InputNumber } from "antd";
import { EnvironmentOutlined, ArrowUpOutlined, ArrowDownOutlined, AimOutlined } from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title } = Typography;
const { Option } = Select;

type TipoRuta = "IDA" | "VUELTA" | "IDA_Y_VUELTA";
type TipoInicioRuta = "DOMICILIO_TRANSPORTISTA" | "VEHICULO";

interface PasajeroOption {
  id: string;
  nombre: string;
  activo: boolean;
}

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

export default function CrearRutaForm() {
  const { user, logout } = useAuth();
  const [form] = Form.useForm();
  const router = useRouter();
  const [pasajeros, setPasajeros] = useState<PasajeroOption[]>([]);
  const [selectedPasajeroIds, setSelectedPasajeroIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inicioCoords, setInicioCoords] = useState<LatLng | null>(null);
  const [searchingInicio, setSearchingInicio] = useState(false);

  useEffect(() => {
    const fetchPasajeros = async () => {
      if (!user?.apiKey) return;
      try {
        if (user.rol !== "TRANSPORTISTA") {
          setLoading(false);
          return;
        }

        const response = await fetch(getApiUrl("/api/v1/pasajeros"), {
          headers: { "X-API-Key": user.apiKey },
        });
        if (response.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error("No se pudieron cargar los pasajeros");
        const data = await response.json();
        setPasajeros((data as PasajeroOption[]).filter((p) => p.activo !== false));
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
    fetchPasajeros();
  }, [user?.apiKey, user?.rol, logout, router]);

  const onFinish = async (values: {
    nombre: string;
    tipo?: TipoRuta;
    inicioTipo?: TipoInicioRuta;
    inicioDireccion?: string;
    inicioComuna?: string;
    latInicio?: number;
    lngInicio?: number;
  }) => {
    if (!user?.apiKey) return;
    if (user.rol !== "TRANSPORTISTA") {
      notification.error({ message: "No autorizado" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/rutas"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": user.apiKey,
        },
        body: JSON.stringify({ ...values, pasajeroIds: selectedPasajeroIds }),
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
          : errorData.error || "Error al crear la ruta";
        throw new Error(errorMessage);
      }

      notification.success({
        message: "Ruta Creada",
        description: "La nueva ruta ha sido creada exitosamente.",
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
    return <Spin description="Cargando datos..." />;
  }

  if (error) {
    return <Alert title="Error" description={error} type="error" showIcon />;
  }

  if (user?.rol !== "TRANSPORTISTA") {
    return (
      <Card>
        <Title level={4}>Crear Nueva Ruta</Title>
        <Alert
          type="info"
          showIcon
          message="Solo los transportistas pueden crear rutas"
          description="Un usuario ADMIN puede visualizar rutas, pero no crearlas."
        />
      </Card>
    );
  }

  const movePasajero = (pasajeroId: string, direction: "up" | "down") => {
    setSelectedPasajeroIds((prev) => {
      const index = prev.indexOf(pasajeroId);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const next = [...prev];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  return (
    <Card>
      <Title level={4}>Crear Nueva Ruta</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ inicioTipo: "VEHICULO" satisfies TipoInicioRuta }}
      >
        <Form.Item
          name="nombre"
          label="Nombre de la Ruta"
          rules={[{ required: true, message: "Por favor, ingresa un nombre para la ruta" }]}
        >
          <Input prefix={<EnvironmentOutlined />} placeholder="Ej: Ruta Mañana - Vitacura" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tipo" label="Tipo de Ruta">
              <Select placeholder="Selecciona un tipo (opcional)">
                <Option value="IDA">IDA</Option>
                <Option value="VUELTA">VUELTA</Option>
                <Option value="IDA_Y_VUELTA">IDA Y VUELTA</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

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
          <Button icon={<AimOutlined />} onClick={async () => {
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
          }} loading={searchingInicio}>
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

        <Divider>Pasajeros en la Ruta</Divider>
        <Form.Item label="Seleccionar pasajeros (en orden)">
          <Select
            mode="multiple"
            placeholder="Selecciona pasajeros"
            value={selectedPasajeroIds}
            onChange={setSelectedPasajeroIds}
            options={pasajeros.map((p) => ({ value: p.id, label: p.nombre }))}
            optionFilterProp="label"
          />
        </Form.Item>

        {selectedPasajeroIds.length > 0 ? (
          <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
            {selectedPasajeroIds.map((pid, index) => {
              const pasajero = pasajeros.find((p) => p.id === pid);
              return (
                <Space key={pid} style={{ width: "100%", justifyContent: "space-between" }}>
                  <span>
                    {index + 1}. {pasajero?.nombre ?? pid}
                  </span>
                  <Space>
                    <Button
                      icon={<ArrowUpOutlined />}
                      onClick={() => movePasajero(pid, "up")}
                      disabled={index === 0}
                    />
                    <Button
                      icon={<ArrowDownOutlined />}
                      onClick={() => movePasajero(pid, "down")}
                      disabled={index === selectedPasajeroIds.length - 1}
                    />
                  </Space>
                </Space>
              );
            })}
          </Space>
        ) : null}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Crear Ruta
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
