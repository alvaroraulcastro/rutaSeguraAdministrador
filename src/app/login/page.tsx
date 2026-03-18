"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const { Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { emailOrUser: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values.emailOrUser, values.password);
      if (result.ok) {
        message.success("Sesión iniciada correctamente");
        router.replace("/");
      } else {
        message.error(result.message ?? "Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresa con tu correo o usuario y contraseña para acceder al panel."
    >
      <Form
        name="login"
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="emailOrUser"
          label="Correo o usuario"
          rules={[{ required: true, message: "Ingresa tu correo o usuario" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="correo@ejemplo.com o usuario"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: true, message: "Ingresa tu contraseña" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Contraseña"
            size="large"
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 8 }}>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Entrar
          </Button>
        </Form.Item>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link href="/forgot-password">
            <Text type="secondary">¿Olvidaste tu contraseña?</Text>
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <Text type="secondary">¿No tienes cuenta? </Text>
          <Link href="/register">Regístrate</Link>
        </div>
      </Form>
    </AuthLayout>
  );
}
