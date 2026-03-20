import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  nombre: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  telefono: z.string(),
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
    const validatedData = registerSchema.parse(data);

    console.info("[auth.register.start]", {
      requestId,
      email: maskEmail(validatedData.email),
      origin: request.headers.get("origin") ?? null,
    });

    const existingUser = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      console.warn("[auth.register.email_in_use]", { requestId, email: maskEmail(validatedData.email) });
      return NextResponse.json({ error: 'El email ya está en uso' }, { status: 400, headers: corsHeaders });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const apiKey = crypto.randomBytes(32).toString('hex');
    const hashedApiKey = await bcrypt.hash(apiKey, 10);

    const newUser = await prisma.usuario.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        apiKey: hashedApiKey,
      },
    });

    // No devolver el hash de la contraseña ni el de la API Key
    const { password: _password, apiKey: _hashedApiKey, ...userWithoutSensitiveData } = newUser;
    console.info("[auth.register.success]", { requestId, userId: newUser.id, email: maskEmail(newUser.email) });

    return NextResponse.json({ user: userWithoutSensitiveData, apiKey: apiKey }, { status: 201, headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn("[auth.register.validation_error]", { requestId });
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error('[auth.register.error]', { requestId, error });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
}
