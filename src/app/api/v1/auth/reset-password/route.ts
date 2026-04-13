import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getCorsHeaders } from '@/lib/cors';
import { registrarLog } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6), // El token de 6 dígitos que enviamos
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
  let requestData: any = null;

  try {
    requestData = await request.json();
    const { email, token, newPassword } = resetPasswordSchema.parse(requestData);

    const user = await prisma.usuario.findFirst({
      where: {
        email,
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Debe ser mayor a la fecha actual
        },
      },
    });

    if (!user) {
      console.warn("[auth.reset-password.invalid_token]", { requestId, email });
      const response = { error: 'Token inválido o expirado' };
      
      await registrarLog({
        metodo: 'POST',
        endpoint: '/api/v1/auth/reset-password',
        ip,
        userAgent,
        payload: requestData,
        respuesta: response,
        statusCode: 400
      });

      return NextResponse.json(response, { status: 400, headers: corsHeaders });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario y limpiar el token
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.info("[auth.reset-password.success]", { requestId, userId: user.id });

    const responseData = { message: 'Contraseña restablecida con éxito' };

    await registrarLog({
      metodo: 'POST',
      endpoint: '/api/v1/auth/reset-password',
      ip,
      userAgent,
      payload: requestData,
      respuesta: responseData,
      statusCode: 200,
      usuarioId: user.id
    });

    return NextResponse.json(responseData, { headers: corsHeaders });

  } catch (error) {
    let statusCode = 500;
    let response: any = { error: 'Error interno del servidor' };

    if (error instanceof z.ZodError) {
      statusCode = 400;
      response = { error: error.issues };
    } else {
      console.error('[auth.reset-password.error]', { requestId, error });
    }

    await registrarLog({
      metodo: 'POST',
      endpoint: '/api/v1/auth/reset-password',
      ip,
      userAgent,
      payload: requestData,
      respuesta: response,
      statusCode: statusCode
    });

    return NextResponse.json(response, { status: statusCode, headers: corsHeaders });
  }
}
