import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCorsHeaders } from '@/lib/cors';
import { getApiKeyFromRequest, validarApiKey, toUsuarioPublico } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

/**
 * GET /api/v1/auth/me
 * Devuelve los datos del usuario autenticado.
 *
 * Autenticación (una de las dos):
 * - Header: X-API-Key: <apiKey> (obtenida en login o registro)
 * - Header: Authorization: Bearer <apiKey>
 */
export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const corsHeaders = getCorsHeaders(request);

  try {
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No autorizado', message: 'Envía X-API-Key o Authorization: Bearer con la clave obtenida al iniciar sesión.' },
        { status: 401, headers: corsHeaders }
      );
    }

    const usuario = await validarApiKey(apiKey);
    if (!usuario) {
      console.warn('[auth.me.invalid_key]', { requestId });
      return NextResponse.json(
        { error: 'No autorizado', message: 'API Key inválida o revocada.' },
        { status: 401, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { user: toUsuarioPublico(usuario) },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[auth.me.error]', { requestId, error });
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500, headers: corsHeaders }
    );
  }
}
