import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { getCorsHeaders } from '@/lib/cors';
import { registrarLog } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
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
    const { email } = forgotPasswordSchema.parse(requestData);

    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    const successResponse = { 
      message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' 
    };

    // Por seguridad, no revelamos si el email existe o no
    if (!user) {
      console.info("[auth.forgot-password.user_not_found]", { requestId, email });
      
      await registrarLog({
        metodo: 'POST',
        endpoint: '/api/v1/auth/forgot-password',
        ip,
        userAgent,
        payload: requestData,
        respuesta: successResponse,
        statusCode: 200
      });

      return NextResponse.json(successResponse, { headers: corsHeaders });
    }

    // Generar un token de 6 dígitos para simplicidad en app móvil o un token largo para web
    // Usaremos un token de 6 dígitos para este ejemplo
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // AQUÍ SE ENVIARÍA EL EMAIL
    console.info("[auth.forgot-password.success]", { 
      requestId, 
      userId: user.id, 
      token: resetToken // En producción NO loguear el token
    });

    const responseData = { 
      ...successResponse,
      // Solo para propósitos de desarrollo/demo devolvemos el token
      _dev_token: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    };

    await registrarLog({
      metodo: 'POST',
      endpoint: '/api/v1/auth/forgot-password',
      ip,
      userAgent,
      payload: requestData,
      respuesta: responseData,
      statusCode: 200,
      usuarioId: user.id
    });

    // En un entorno real, no devolveríamos el token en la respuesta
    return NextResponse.json(responseData, { headers: corsHeaders });

  } catch (error) {
    let statusCode = 500;
    let response: any = { error: 'Error interno del servidor' };

    if (error instanceof z.ZodError) {
      statusCode = 400;
      response = { error: error.issues };
    } else {
      console.error('[auth.forgot-password.error]', { requestId, error });
    }

    await registrarLog({
      metodo: 'POST',
      endpoint: '/api/v1/auth/forgot-password',
      ip,
      userAgent,
      payload: requestData,
      respuesta: response,
      statusCode: statusCode
    });

    return NextResponse.json(response, { status: statusCode, headers: corsHeaders });
  }
}
