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
  const rest = { ...usuario } as UsuarioConSecretos;
  Reflect.deleteProperty(rest, 'password');
  Reflect.deleteProperty(rest, 'apiKey');
  return rest as Omit<UsuarioConSecretos, 'password' | 'apiKey'>;
}

/**
 * Valida una API Key contra la base de datos.
 * Esta función debe ejecutarse en el Node.js Runtime (API Routes).
 */
export async function validarApiKey(apiKey: string | null) {
  if (!apiKey) return null;

  try {
    // Extraer el prefijo del usuario ID de la API Key para búsqueda eficiente
    const prefixMatch = apiKey.match(/^([a-z0-9]+)_/);
    
    if (prefixMatch) {
      const userPrefix = prefixMatch[1];
      
      // Buscar usuarios cuyo ID comience con el prefijo
      const usuarios = await prisma.usuario.findMany({
        where: {
          AND: [
            { apiKey: { not: null } },
            { id: { startsWith: userPrefix } }
          ]
        }
      });

      for (const usuario of usuarios) {
        if (usuario.apiKey && await bcrypt.compare(apiKey, usuario.apiKey)) {
          return usuario;
        }
      }
    } else {
      // Fallback: búsqueda en todos los usuarios (para API Keys antiguas)
      const usuarios = await prisma.usuario.findMany({
        where: { apiKey: { not: null } }
      });

      for (const usuario of usuarios) {
        if (usuario.apiKey && await bcrypt.compare(apiKey, usuario.apiKey)) {
          return usuario;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}
