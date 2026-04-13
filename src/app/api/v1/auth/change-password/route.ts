import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getCorsHeaders } from '@/lib/cors';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { registrarLog } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function POST(request: Request) {
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
    const { currentPassword, newPassword } = changePasswordSchema.parse(data);

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, usuario.password);
    if (!isPasswordValid) {
      const response = { error: 'La contraseña actual es incorrecta' };
      await registrarLog({
        metodo: 'POST',
        endpoint: '/api/v1/auth/change-password',
        ip,
        userAgent,
        payload: { currentPassword: '***', newPassword: '***' },
        respuesta: response,
        statusCode: 400,
        usuarioId: usuario.id
      });
      return NextResponse.json(response, { status: 400, headers: corsHeaders });
    }

    // Hashear nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: hashedNewPassword },
    });

    const responseData = { message: 'Contraseña actualizada con éxito' };

    await registrarLog({
      metodo: 'POST',
      endpoint: '/api/v1/auth/change-password',
      ip,
      userAgent,
      payload: { currentPassword: '***', newPassword: '***' },
      respuesta: responseData,
      statusCode: 200,
      usuarioId: usuario.id
    });

    return NextResponse.json(responseData, { headers: corsHeaders });

  } catch (error) {
    let statusCode = 500;
    let response: any = { error: 'Error interno del servidor' };

    if (error instanceof z.ZodError) {
      statusCode = 400;
      response = { error: error.issues };
    } else {
      console.error('[auth.change-password.error]', { requestId, error });
    }

    return NextResponse.json(response, { status: statusCode, headers: corsHeaders });
  }
}
