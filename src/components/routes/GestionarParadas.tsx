"use client";

import React, { useState, useEffect } from "react";
import { Table, Button, Space, Card, Typography, Select, notification, Spin, Modal } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/api";

const { Title } = Typography;
const { Option } = Select;

interface Pasajero {
  id: string;
  nombre: string;
  direccionDomicilio: string;
}

interface Parada {
  id: string;
  orden: number;
  pasajeroId: string;
  pasajero: Pasajero;
}

interface GestionarParadasProps {
  rutaId: string;
}

export default function GestionarParadas({ rutaId }: GestionarParadasProps) {
  const { user } = useAuth();
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPasajero, setSelectedPasajero] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user?.apiKey) return;
    try {
      setLoading(true);
      const [paradasRes, pasajerosRes] = await Promise.all([
        fetch(getApiUrl(`/api/v1/rutas/${rutaId}/paradas`), { headers: { "X-API-Key": user.apiKey } }),
        fetch(getApiUrl("/api/v1/pasajeros"), { headers: { "X-API-Key": user.apiKey } }),
      ]);

      if (!paradasRes.ok || !pasajerosRes.ok) throw new Error("Error al cargar datos");

      const paradasData = await paradasRes.json();
      const pasajerosData = await pasajerosRes.json();

      setParadas(paradasData);
      setPasajeros(pasajerosData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: "Error", description: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rutaId, user?.apiKey]);

  const handleAddParada = async () => {
    if (!selectedPasajero || !user?.apiKey) return;
    try {
      const response = await fetch(getApiUrl(`/api/v1/rutas/${rutaId}/paradas`), {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": user.apiKey },
        body: JSON.stringify({ pasajeroId: selectedPasajero, orden: paradas.length + 1 }),
      });

      if (!response.ok) throw new Error("Error al añadir parada");
      
      setSelectedPasajero(null);
      fetchData();
      notification.success({ message: "Parada añadida" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: "Error", description: err.message });
      }
    }
  };

  const handleDeleteParada = (paradaId: string) => {
    Modal.confirm({
      title: "¿Eliminar esta parada de la ruta?",
      onOk: async () => {
        if (!user?.apiKey) return;
        try {
          const response = await fetch(getApiUrl(`/api/v1/rutas/${rutaId}/paradas/${paradaId}`), {
            method: "DELETE",
            headers: { "X-API-Key": user.apiKey },
          });
          if (!response.ok) throw new Error("Error al eliminar");
          fetchData();
          notification.success({ message: "Parada eliminada" });
        } catch (err: unknown) {
          if (err instanceof Error) {
            notification.error({ message: "Error", description: err.message });
          }
        }
      },
    });
  };

  const handleReorder = async (paradaId: string, direction: 'up' | 'down') => {
    if (!user?.apiKey) return;
    const index = paradas.findIndex(p => p.id === paradaId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === paradas.length - 1)) return;

    const newParadas = [...paradas];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newParadas[index], newParadas[targetIndex]] = [newParadas[targetIndex], newParadas[index]];

    // Actualizar orden localmente y enviar a API
    const updatePayload = newParadas.map((p, i) => ({ id: p.id, orden: i + 1 }));

    try {
      const response = await fetch(getApiUrl(`/api/v1/rutas/${rutaId}/paradas`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-API-Key": user.apiKey },
        body: JSON.stringify(updatePayload),
      });
      if (!response.ok) throw new Error("Error al reordenar");
      setParadas(newParadas);
    } catch (err: unknown) {
      if (err instanceof Error) {
        notification.error({ message: "Error", description: err.message });
      }
    }
  };

  const columns = [
    { title: "Orden", dataIndex: "orden", key: "orden", width: 80 },
    { title: "Pasajero", key: "pasajero", render: (record: Parada) => record.pasajero.nombre },
    { title: "Dirección", key: "direccion", render: (record: Parada) => record.pasajero.direccionDomicilio },
    {
      title: "Acciones",
      key: "actions",
      render: (record: Parada) => (
        <Space>
          <Button icon={<ArrowUpOutlined />} onClick={() => handleReorder(record.id, 'up')} disabled={record.orden === 1} />
          <Button icon={<ArrowDownOutlined />} onClick={() => handleReorder(record.id, 'down')} disabled={record.orden === paradas.length} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteParada(record.id)} />
        </Space>
      ),
    },
  ];

  if (loading) return <Spin size="large" tip="Cargando paradas..." />;

  return (
    <Card>
      <Title level={4}>Gestionar Paradas de la Ruta</Title>
      <Space style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 300 }}
          placeholder="Seleccionar pasajero para añadir"
          value={selectedPasajero}
          onChange={setSelectedPasajero}
        >
          {pasajeros.filter(p => !paradas.some(pa => pa.pasajeroId === p.id)).map(p => (
            <Option key={p.id} value={p.id}>{p.nombre}</Option>
          ))}
        </Select>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddParada} disabled={!selectedPasajero}>
          Añadir Parada
        </Button>
      </Space>
      <Table columns={columns} dataSource={paradas} rowKey="id" pagination={false} />
    </Card>
  );
}
