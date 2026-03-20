"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const { Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    nombre: string;
    email: string;
    password: string;
    confirm: string;
    telefono: string;
  }) => {
    if (values.password !== values.confirm) {
      message.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const result = await register({
        nombre: values.nombre,
        email: values.email,
        password: values.password,
        telefono: values.telefono,
      });
      if (result.ok) {
        message.success("Cuenta creada correctamente");
        router.replace("/");
      } else {
        message.error(result.message ?? "Error al registrar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Completa los datos para registrarte en el panel de administración."
    >
      <Form
        name="register"
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="nombre"
          label="Nombre completo"
          rules={[{ required: true, message: "Ingresa tu nombre" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Ej: Juan Pérez"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="email"
          label="Correo electrónico"
          rules={[
            { required: true, message: "Ingresa tu correo" },
            { type: "email", message: "Correo no válido" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="correo@ejemplo.com"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="telefono"
          label="Teléfono"
          rules={[{ required: true, message: "Ingresa tu teléfono" }]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="+56 9 ..."
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[
            { required: true, message: "Ingresa una contraseña" },
            { min: 6, message: "Mínimo 6 caracteres" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mínimo 6 caracteres"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirmar contraseña"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Confirma tu contraseña" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) return Promise.resolve();
                return Promise.reject(new Error("Las contraseñas no coinciden"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Repite la contraseña"
            size="large"
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Registrarme
          </Button>
        </Form.Item>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary">¿Ya tienes cuenta? </Text>
          <Link href="/login">Iniciar sesión</Link>
        </div>
      </Form>
    </AuthLayout>
  );
}
