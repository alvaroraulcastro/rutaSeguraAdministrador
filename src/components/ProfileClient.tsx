"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Space, Divider, notification, Row, Col, Avatar } from "antd";
import { UserOutlined, PhoneOutlined, LockOutlined, SaveOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";

const { Title, Text } = Typography;

export default function ProfileClient() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const onUpdateProfile = async (values: any) => {
    setUpdatingProfile(true);
    const result = await updateProfile(values);
    setUpdatingProfile(false);
    
    if (result.ok) {
      notification.success({
        message: "Perfil Actualizado",
        description: "Tus datos han sido guardados correctamente.",
      });
    } else {
      notification.error({
        message: "Error",
        description: result.message,
      });
    }
  };

  const onChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(values.currentPassword, values.newPassword);
    setChangingPassword(false);

    if (result.ok) {
      notification.success({
        message: "Contraseña Cambiada",
        description: "Tu contraseña ha sido actualizada con éxito.",
      });
      passwordForm.resetFields();
    } else {
      notification.error({
        message: "Error",
        description: result.message,
      });
    }
  };

  if (!user) return null;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={2}>Mi Perfil</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<Space><UserOutlined /> Información Personal</Space>}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar size={100} src={user.foto} icon={<UserOutlined />} />
              <div style={{ marginTop: 8 }}>
                <Text strong>{user.nombre}</Text>
                <br />
                <Text type="secondary">{user.email}</Text>
                <br />
                <Text code>{user.rol}</Text>
              </div>
            </div>
            
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={onUpdateProfile}
              initialValues={{
                nombre: user.nombre,
                telefono: (user as any).telefono || "",
                foto: user.foto || "",
              }}
            >
              <Form.Item name="nombre" label="Nombre Completo" rules={[{ required: true, message: "Ingresa tu nombre" }]}>
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              
              <Form.Item name="telefono" label="Teléfono">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              
              <Form.Item name="foto" label="URL de Foto de Perfil">
                <Input placeholder="https://ejemplo.com/foto.jpg" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={updatingProfile} block>
                  Guardar Cambios
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<Space><LockOutlined /> Seguridad</Space>}>
            <Text type="secondary">
              Te recomendamos usar una contraseña segura que no utilices en otros sitios.
            </Text>
            <Divider />
            
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onChangePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Contraseña Actual"
                rules={[{ required: true, message: "Ingresa tu contraseña actual" }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="Nueva Contraseña"
                rules={[
                  { required: true, message: "Ingresa tu nueva contraseña" },
                  { min: 6, message: "Mínimo 6 caracteres" }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Confirmar Nueva Contraseña"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: "Confirma tu nueva contraseña" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" danger htmlType="submit" loading={changingPassword} block>
                  Actualizar Contraseña
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
