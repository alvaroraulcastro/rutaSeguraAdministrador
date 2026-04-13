import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getCorsHeaders } from '@/lib/cors';
import { registrarLog } from '@/lib/logger';
import { getApiUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const u = user ? `${user[0]}***` : "***";
  return `${u}@${domain}`;
}

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
    const validatedData = loginSchema.parse(requestData);

    console.info("[auth.login.start]", {
      requestId,
      email: maskEmail(validatedData.email),
      origin: request.headers.get("origin") ?? null,
    });

    const user = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !await bcrypt.compare(validatedData.password, user.password)) {
      console.warn("[auth.login.invalid_credentials]", {
        requestId,
        email: maskEmail(validatedData.email),
      });

      const response = { error: 'Credenciales inválidas' };
      await registrarLog({
        metodo: 'POST',
        endpoint: '/api/v1/auth/login',
        ip,
        userAgent,
        payload: requestData,
        respuesta: response,
        statusCode: 401,
        usuarioId: user?.id
      });

      return NextResponse.json(response, { status: 401, headers: corsHeaders });
    }

    // Al iniciar sesión, generamos una nueva API Key para el usuario.
    // Esto actúa como un refresco de sesión en el esquema de "JWT por API Key".
    const apiKey = crypto.randomBytes(32).toString('hex');
    const hashedApiKey = await bcrypt.hash(apiKey, 10);

    const updatedUser = await prisma.usuario.update({
      where: { id: user.id },
      data: { apiKey: hashedApiKey },
    });

    const { password: _password, apiKey: _hashedApiKey, ...userWithoutSensitiveData } = updatedUser;
    
    console.info("[auth.login.success]", {
      requestId,
      userId: updatedUser.id,
      email: maskEmail(updatedUser.email),
    });

    const responseData = { 
      user: userWithoutSensitiveData, 
      apiKey: apiKey 
    };

    await registrarLog({
      metodo: 'POST',
      endpoint: '/api/v1/auth/login',
      ip,
      userAgent,
      payload: requestData,
      respuesta: responseData,
      statusCode: 200,
      usuarioId: updatedUser.id
    });

    return NextResponse.json(responseData, { headers: corsHeaders });

  } catch (error) {
    let statusCode = 500;
    let response: any = { error: 'Error interno del servidor' };

    if (error instanceof z.ZodError) {
      statusCode = 400;
      response = { error: error.issues };
      console.warn("[auth.login.validation_error]", { requestId });
    } else {
      console.error('[auth.login.error]', { requestId, error });
    }

    await registrarLog({
      metodo: 'POST',
      endpoint: '/api/v1/auth/login',
      ip,
      userAgent,
      payload: requestData,
      respuesta: response,
      statusCode: statusCode
    });

    return NextResponse.json(response, { status: statusCode, headers: corsHeaders });
  }
}
