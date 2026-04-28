import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import type { Usuario } from '@prisma/client';

/**
 * Valida una API Key contra la base de datos.
 * Esta función debe ejecutarse en el Node.js Runtime (API Routes).
 */
export async function validarApiKey(apiKey: string | null) {
  if (!apiKey) return null;

  // Nota: Buscar todos y comparar es ineficiente. 
  // En un sistema real con muchos usuarios, usaríamos un prefijo o un ID en la API Key
  // para buscar directamente el registro.
  const usuarios = await prisma.usuario.findMany({
    where: {
      apiKey: { not: null }
    }
  });

  for (const usuario of usuarios) {
    if (usuario.apiKey && await bcrypt.compare(apiKey, usuario.apiKey)) {
      return usuario;
    }
  }

  return null;
}

export async function autenticarDesdeHeaders(headers: Headers) {
  const apiKey = headers.get('X-API-Key');
  const usuario = await validarApiKey(apiKey);
  return usuario;
}

export function esAdmin(usuario: Usuario) {
  return usuario.rol === 'ADMIN';
}

export const usuarioPublicSelect = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  telefono: true,
  foto: true,
  patente: true,
  modelo: true,
  capacidad: true,
  createdAt: true,
  updatedAt: true,
} as const;
