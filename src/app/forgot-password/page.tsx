"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form, Input, Button, Typography, message, Result } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";

const { Text } = Typography;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailSent, setEmailSent] = useState("");

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const result = await forgotPassword(values.email);
      if (result.ok) {
        setEmailSent(values.email);
        setSent(true);
        message.success("Revisa tu correo para restablecer la contraseña");
      } else {
        message.error(result.message ?? "Error al enviar el enlace");
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Recuperar contraseña">
        <Result
          status="success"
          title="Correo enviado"
          subTitle={
            <>
              Si existe una cuenta con <strong>{emailSent}</strong>, recibirás un
              enlace para restablecer tu contraseña en unos minutos. Revisa también
              la carpeta de spam.
            </>
          }
          extra={[
            <Link key="login" href="/login">
              <Button type="primary" icon={<ArrowLeftOutlined />}>
                Volver al inicio de sesión
              </Button>
            </Link>,
          ]}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresa el correo de tu cuenta y te enviaremos un enlace para restablecer tu contraseña."
    >
      <Form
        name="forgot"
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        autoComplete="off"
      >
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
        <Form.Item style={{ marginBottom: 8 }}>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            Enviar enlace de recuperación
          </Button>
        </Form.Item>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link href="/login">
            <Text type="secondary">
              <ArrowLeftOutlined /> Volver al inicio de sesión
            </Text>
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
}
