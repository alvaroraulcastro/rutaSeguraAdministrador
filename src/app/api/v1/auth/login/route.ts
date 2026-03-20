import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

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
  try {
    const data = await request.json();
    const validatedData = loginSchema.parse(data);

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
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401, headers: corsHeaders });
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

    return NextResponse.json({ 
      user: userWithoutSensitiveData, 
      apiKey: apiKey 
    }, { headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn("[auth.login.validation_error]", { requestId });
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error('[auth.login.error]', { requestId, error });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
}
