import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { getCorsHeaders } from '@/lib/cors';
import { getApiKeyFromRequest, validarApiKey, toUsuarioPublico } from '@/lib/auth';
import { registrarLog } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  nombre: z.string().min(3).optional(),
  telefono: z.string().optional(),
  foto: z.string().url().nullable().optional(),
});

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function PATCH(request: Request) {
  const requestId = crypto.randomUUID();
  const corsHeaders = getCorsHeaders(request);
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent');

  try {
    const apiKey = getApiKeyFromRequest(request);
    if (!apiKey) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: corsHeaders });
    }

    const usuario = await validarApiKey(apiKey);
    if (!usuario) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401, headers: corsHeaders });
    }

    const data = await request.json();
    const validatedData = updateProfileSchema.parse(data);

    const updatedUser = await prisma.usuario.update({
      where: { id: usuario.id },
      data: validatedData,
    });

    const responseData = { user: toUsuarioPublico(updatedUser) };

    await registrarLog({
      metodo: 'PATCH',
      endpoint: '/api/v1/auth/profile',
      ip,
      userAgent,
      payload: data,
      respuesta: responseData,
      statusCode: 200,
      usuarioId: usuario.id
    });

    return NextResponse.json(responseData, { headers: corsHeaders });

  } catch (error) {
    let statusCode = 500;
    let response: { error: string } | { error: z.ZodIssue[] } = { error: 'Error interno del servidor' };

    if (error instanceof z.ZodError) {
      statusCode = 400;
      response = { error: error.issues };
    } else {
      console.error('[auth.profile.patch.error]', { requestId, error });
    }

    return NextResponse.json(response, { status: statusCode, headers: corsHeaders });
  }
}
