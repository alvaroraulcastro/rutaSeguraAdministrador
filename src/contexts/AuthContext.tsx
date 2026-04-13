"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { getApiUrl } from "@/lib/api";

const AUTH_STORAGE_KEY = "rutasegura_admin_user";
const AUTH_DEBUG_STORAGE_KEY = "rutasegura_debug_auth";

export type User = {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  apiKey: string; // La API Key real (no el hash) para usar en headers
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (data: { nombre: string; email: string; password: string; telefono: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ ok: boolean; message?: string }>;
  updateProfile: (data: { nombre?: string; telefono?: string; foto?: string | null }) => Promise<{ ok: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function saveUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_STORAGE_KEY);
}

function shouldLogAuth() {
  if (typeof window === "undefined") return false;
  const localFlag = localStorage.getItem(AUTH_DEBUG_STORAGE_KEY) === "1";
  const urlFlag = new URLSearchParams(window.location.search).get("debugAuth") === "1";
  return localFlag || urlFlag;
}

function maskEmail(email: string) {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const userPart = email.slice(0, at);
  const domainPart = email.slice(at + 1);
  const maskedUser = `${userPart[0]}***`;
  return `${maskedUser}@${domainPart}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        try {
          return JSON.parse(raw) as User;
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    }
    return null;
  });
  const [isLoading] = useState(false);
  const isProd = process.env.NODE_ENV === "production";

  const login = useCallback(async (email: string, password: string) => {
    const requestId =
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
    try {
      const shouldLog = !isProd || shouldLogAuth();
      if (shouldLog) {
        console.log("[auth.login.client.before_request]", {
          requestId,
          url: getApiUrl("/api/v1/auth/login"),
          method: "POST",
          email: maskEmail(email),
        });
      }
      const response = await fetch(getApiUrl("/api/v1/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!isProd || shouldLogAuth()) {
        console.log("[auth.login.client.after_response]", {
          requestId,
          status: response.status,
          ok: response.ok,
        });
      }

      const data = await response.json();

      if (!response.ok) {
        if (!isProd || shouldLogAuth()) {
          console.log("[auth.login.client.error_payload]", {
            requestId,
            error: data?.error ?? null,
          });
        }
        return { ok: false, message: data.error || "Error al iniciar sesión" };
      }

      const u: User = {
        ...data.user,
        apiKey: data.apiKey,
      };

      setUser(u);
      saveUser(u);
      if (!isProd || shouldLogAuth()) {
        console.log("[auth.login.client.success]", { requestId, userId: u.id });
      }
      return { ok: true };
    } catch (error) {
      if (!isProd || shouldLogAuth()) {
        console.log("[auth.login.client.exception]", { requestId, error });
      }
      console.error("Login context error:", error);
      return { ok: false, message: "Error de conexión con el servidor" };
    }
  }, [isProd]);

  const register = useCallback(
    async (data: { nombre: string; email: string; password: string; telefono: string }) => {
      try {
        if (!isProd) console.debug("[auth.register.client.start]", { email: data.email });
        const response = await fetch(getApiUrl("/api/v1/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          if (!isProd) console.debug("[auth.register.client.fail]", { status: response.status, error: result?.error });
          return { ok: false, message: result.error || "Error al registrarse" };
        }

        const u: User = {
          ...result.user,
          apiKey: result.apiKey,
        };

        setUser(u);
        saveUser(u);
        if (!isProd) console.debug("[auth.register.client.success]", { userId: u.id });
        return { ok: true };
      } catch (error) {
        console.error("Register context error:", error);
        return { ok: false, message: "Error de conexión con el servidor" };
      }
    },
    [isProd]
  );

  const logout = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    if (!email?.trim()) return { ok: false, message: "Ingresa tu correo" };
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, message: data.error || "Error al solicitar recuperación" };
      return { ok: true, message: data.message };
    } catch (error) {
      console.error("ForgotPassword context error:", error);
      return { ok: false, message: "Error de conexión con el servidor" };
    }
  }, []);

  const updateProfile = useCallback(async (data: { nombre?: string; telefono?: string; foto?: string | null }) => {
    if (!user?.apiKey) return { ok: false, message: "No autorizado" };
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/profile"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": user.apiKey,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) return { ok: false, message: result.error || "Error al actualizar perfil" };
      
      const updatedUser = { ...user, ...result.user };
      setUser(updatedUser);
      saveUser(updatedUser);
      return { ok: true };
    } catch (error) {
      console.error("UpdateProfile context error:", error);
      return { ok: false, message: "Error de conexión con el servidor" };
    }
  }, [user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!user?.apiKey) return { ok: false, message: "No autorizado" };
    try {
      const response = await fetch(getApiUrl("/api/v1/auth/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": user.apiKey,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) return { ok: false, message: result.error || "Error al cambiar contraseña" };
      return { ok: true, message: result.message };
    } catch (error) {
      console.error("ChangePassword context error:", error);
      return { ok: false, message: "Error de conexión con el servidor" };
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
