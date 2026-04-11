import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

/** Registro de usuario tal como lo devuelve Prisma (incluye password y apiKey hash). */
type UsuarioConSecretos = NonNullable<Awaited<ReturnType<typeof prisma.usuario.findFirst>>>;

/**
 * Obtiene la API Key desde el request (app móvil puede usar X-API-Key o Authorization: Bearer).
 */
export function getApiKeyFromRequest(request: Request): string | null {
  const xApiKey = request.headers.get('X-API-Key');
  if (xApiKey?.trim()) return xApiKey.trim();

  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    if (token) return token;
  }

  return null;
}

/**
 * Usuario seguro para respuestas JSON (sin password ni hash de apiKey).
 */
export function toUsuarioPublico(usuario: UsuarioConSecretos) {
  const { password: _p, apiKey: _a, ...rest } = usuario;
  return rest;
}

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
