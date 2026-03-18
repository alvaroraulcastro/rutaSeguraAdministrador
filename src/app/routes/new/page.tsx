"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  Steps,
  Button,
  Form,
  Input,
  Select,
  Typography,
  Space,
  Table,
  Tag,
  message,
  Empty,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  UserAddOutlined,
  UnorderedListOutlined,
  CheckOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
  HomeOutlined,
  AimOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { MOCK_PASSENGERS_WITH_ADDRESSES } from "@/data/mockPassengersWithAddresses";

const { Title, Text } = Typography;

type StopInRoute = {
  key: string;
  order: number;
  passengerId: string;
  passengerName: string;
  addressId: string;
  addressLabel: string;
  address: string;
};

const STEPS = [
  { key: 0, title: "Origen y destino", icon: <EnvironmentOutlined /> },
  { key: 1, title: "Pasajeros y direcciones", icon: <UserAddOutlined /> },
  { key: 2, title: "Orden de paradas", icon: <UnorderedListOutlined /> },
  { key: 3, title: "Resumen", icon: <CheckOutlined /> },
];

export default function NewRoutePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState<StopInRoute[]>([]);
  const [pendingPassengerId, setPendingPassengerId] = useState<string | null>(null);

  const canAddMorePassengers = useMemo(() => {
    const used = new Set(stops.map((s) => s.passengerId));
    return MOCK_PASSENGERS_WITH_ADDRESSES.some((p) => !used.has(p.id));
  }, [stops]);

  const addPassenger = (passengerId: string, addressId: string) => {
    const passenger = MOCK_PASSENGERS_WITH_ADDRESSES.find((p) => p.id === passengerId);
    const address = passenger?.addresses.find((a) => a.id === addressId);
    if (!passenger || !address) return;
    if (stops.some((s) => s.passengerId === passengerId)) {
      message.warning("Este pasajero ya está en la ruta");
      return;
    }
    setStops((prev) => [
      ...prev,
      {
        key: `stop-${passengerId}-${addressId}`,
        order: prev.length + 1,
        passengerId: passenger.id,
        passengerName: passenger.name,
        addressId: address.id,
        addressLabel: address.label,
        address: address.address,
      },
    ]);
  };

  const removeStop = (key: string) => {
    setStops((prev) => {
      const next = prev.filter((s) => s.key !== key);
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const moveStop = (key: string, direction: "up" | "down") => {
    setStops((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      if (idx < 0) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swap = direction === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const step0Valid = origin.trim() && destination.trim();
  const step1Valid = stops.length > 0;

  const goNext = () => {
    if (step === 0 && !step0Valid) {
      message.warning("Completa origen y destino");
      return;
    }
    if (step === 1 && !step1Valid) {
      message.warning("Agrega al menos un pasajero con su dirección");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleCreate = () => {
    message.success("Ruta creada correctamente (maqueta). Se optimizó el orden para reducir el trayecto.");
    router.push("/routes");
  };

  const orderColumns: ColumnsType<StopInRoute> = [
    { title: "Orden", dataIndex: "order", width: 70, align: "center" },
    {
      title: "Pasajero",
      dataIndex: "passengerName",
      key: "passengerName",
      render: (name) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: "Dirección elegida",
      key: "address",
      render: (_, r) => (
        <Space>
          <HomeOutlined />
          <Text strong>{r.addressLabel}</Text>
          <Text type="secondary">— {r.address}</Text>
        </Space>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 120,
      render: (_, r) => (
        <Space>
          <Tooltip title="Subir">
            <Button
              type="text"
              size="small"
              icon={<UpOutlined />}
              disabled={r.order === 1}
              onClick={() => moveStop(r.key, "up")}
            />
          </Tooltip>
          <Tooltip title="Bajar">
            <Button
              type="text"
              size="small"
              icon={<DownOutlined />}
              disabled={r.order === stops.length}
              onClick={() => moveStop(r.key, "down")}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeStop(r.key)}
          />
        </Space>
      ),
    },
  ];

  const passengersNotInRoute = useMemo(
    () => MOCK_PASSENGERS_WITH_ADDRESSES.filter((p) => !stops.some((s) => s.passengerId === p.id)),
    [stops]
  );

  return (
    <>
      <Space style={{ marginBottom: 24 }} align="center">
        <Link href="/routes">
          <Button icon={<ArrowLeftOutlined />}>Volver a Rutas</Button>
        </Link>
        <Title level={2} style={{ margin: 0 }}>
          Crear nueva ruta
        </Title>
      </Space>

      <Card>
        <Steps current={step} style={{ marginBottom: 32 }}>
          {STEPS.map((s) => (
            <Steps.Step key={s.key} title={s.title} icon={s.icon} />
          ))}
        </Steps>

        {/* Step 0: Origen y destino */}
        {step === 0 && (
          <Card title="Origen y destino de la ruta" style={{ maxWidth: 560 }}>
            <Form layout="vertical">
              <Form.Item
                label="Origen de la ruta"
                required
                tooltip="Punto de partida del transportista (ej. domicilio, estacionamiento)"
              >
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder="Ej: Av. Providencia 2000, Santiago"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  size="large"
                />
              </Form.Item>
              <Form.Item
                label="Destino de la ruta"
                required
                tooltip="Destino final común (ej. colegio, oficina)"
              >
                <Input
                  prefix={<AimOutlined />}
                  placeholder="Ej: Colegio Saint George, Las Condes"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  size="large"
                />
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Step 1: Pasajeros y direcciones */}
        {step === 1 && (
          <Card title="Agregar pasajeros y elegir dirección de recogida">
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              Elige pasajeros existentes en el sistema y, para cada uno, la dirección donde debe ser recogido (un pasajero puede tener varias direcciones).
            </Text>
            <div style={{ marginBottom: 24 }}>
              <Space wrap align="start">
                <Select
                  key={`add-passenger-${stops.length}-${pendingPassengerId ?? ""}`}
                  placeholder="Seleccionar pasajero..."
                  style={{ width: 280 }}
                  allowClear
                  optionFilterProp="label"
                  options={passengersNotInRoute.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.addresses.length} dirección${p.addresses.length > 1 ? "es" : ""})`,
                  }))}
                  onSelect={(passengerId) => {
                    const p = MOCK_PASSENGERS_WITH_ADDRESSES.find((x) => x.id === passengerId);
                    if (!p) return;
                    if (p.addresses.length === 1) {
                      addPassenger(passengerId, p.addresses[0].id);
                      return;
                    }
                    setPendingPassengerId(passengerId);
                  }}
                />
                {pendingPassengerId && (() => {
                  const p = MOCK_PASSENGERS_WITH_ADDRESSES.find((x) => x.id === pendingPassengerId);
                  if (!p) return null;
                  return (
                    <>
                      <Select
                        placeholder="Elegir dirección del pasajero..."
                        style={{ width: 280 }}
                        options={p.addresses.map((a) => ({
                          value: a.id,
                          label: `${a.label}: ${a.address}`,
                        }))}
                        onChange={(addressId) => {
                          addPassenger(pendingPassengerId, addressId);
                          setPendingPassengerId(null);
                        }}
                      />
                      <Button size="small" onClick={() => setPendingPassengerId(null)}>
                        Cancelar
                      </Button>
                    </>
                  );
                })()}
              </Space>
            </div>
            <Table
              size="small"
              columns={[
                { title: "#", dataIndex: "order", width: 50 },
                { title: "Pasajero", dataIndex: "passengerName" },
                {
                  title: "Dirección",
                  key: "addr",
                  render: (_, r) => (
                    <Text type="secondary">{r.addressLabel} — {r.address}</Text>
                  ),
                },
                {
                  title: "",
                  key: "del",
                  width: 80,
                  render: (_, r) => (
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeStop(r.key)} />
                  ),
                },
              ]}
              dataSource={stops}
              rowKey="key"
              pagination={false}
              locale={{ emptyText: "Aún no hay pasajeros. Selecciona uno arriba." }}
            />
          </Card>
        )}

        {/* Step 2: Orden de paradas */}
        {step === 2 && (
          <Card title="Orden de paradas para optimizar el trayecto">
            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              Ajusta el orden de las paradas para que la ruta demore menos. Puedes subir o bajar cada parada.
            </Text>
            {stops.length === 0 ? (
              <Empty description="No hay paradas. Vuelve al paso anterior." />
            ) : (
              <Table
                columns={orderColumns}
                dataSource={stops}
                rowKey="key"
                pagination={false}
              />
            )}
          </Card>
        )}

        {/* Step 3: Resumen */}
        {step === 3 && (
          <Card title="Resumen de la ruta">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Text type="secondary">Origen</Text>
                <div><EnvironmentOutlined /> {origin}</div>
              </div>
              <div>
                <Text type="secondary">Destino</Text>
                <div><AimOutlined /> {destination}</div>
              </div>
              <div>
                <Text type="secondary">Paradas ({stops.length})</Text>
                <ol style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                  {stops.map((s) => (
                    <li key={s.key}>
                      <strong>{s.passengerName}</strong> — {s.addressLabel}: {s.address}
                    </li>
                  ))}
                </ol>
              </div>
            </Space>
          </Card>
        )}

        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between" }}>
          <Button onClick={goPrev} disabled={step === 0} icon={<ArrowLeftOutlined />}>
            Anterior
          </Button>
          {step < 3 ? (
            <Button type="primary" onClick={goNext} icon={<ArrowRightOutlined />}>
              Siguiente
            </Button>
          ) : (
            <Button type="primary" onClick={handleCreate} icon={<CheckOutlined />}>
              Crear ruta
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}
