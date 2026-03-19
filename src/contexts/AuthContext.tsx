"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const AUTH_STORAGE_KEY = "rutasegura_admin_user";

export type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (emailOrUser: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ ok: boolean; message?: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function saveUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_STORAGE_KEY);
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

  const login = useCallback(async (emailOrUser: string, password: string) => {
    // Mock: aceptar cualquier email/usuario; contraseña cualquiera para demo
    if (!emailOrUser?.trim()) return { ok: false, message: "Ingresa tu correo o usuario" };
    if (!password?.trim()) return { ok: false, message: "Ingresa tu contraseña" };
    const u: User = {
      id: "1",
      email: emailOrUser.includes("@") ? emailOrUser : `${emailOrUser}@rutasegura.local`,
      name: emailOrUser.split("@")[0] || "Usuario",
    };
    setUser(u);
    saveUser(u);
    return { ok: true };
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      if (!data.name?.trim()) return { ok: false, message: "El nombre es obligatorio" };
      if (!data.email?.trim()) return { ok: false, message: "El correo es obligatorio" };
      if (!data.password?.trim()) return { ok: false, message: "La contraseña es obligatoria" };
      if (data.password.length < 6) return { ok: false, message: "La contraseña debe tener al menos 6 caracteres" };
      // Mock: registro exitoso, no guardamos usuario hasta que haga login
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    saveUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    if (!email?.trim()) return { ok: false, message: "Ingresa tu correo" };
    // Mock: siempre éxito
    return { ok: true };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
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
