import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
  const corsHeaders = { ...getCorsHeaders(request), "X-Request-Id": requestId };
  const isProd = process.env.NODE_ENV === "production";
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
    const userWithoutSensitiveData = ((u) => {
      const { password, apiKey: apiKeyHash, ...rest } = u;
      void password;
      void apiKeyHash;
      return rest;
    })(newUser);
    console.info("[auth.register.success]", { requestId, userId: newUser.id, email: maskEmail(newUser.email) });

    return NextResponse.json({ user: userWithoutSensitiveData, apiKey: apiKey }, { status: 201, headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn("[auth.register.validation_error]", { requestId });
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      const errObj = error as unknown as Record<string, unknown>;
      const errorCode = typeof errObj.errorCode === "string" ? errObj.errorCode : null;
      console.error("[auth.register.db_init_error]", {
        requestId,
        code: errorCode,
        message: error.message,
      });
      return NextResponse.json(
        {
          error: "Base de datos no disponible",
          ...(isProd ? {} : { details: error.message }),
        },
        { status: 503, headers: corsHeaders }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("[auth.register.db_known_error]", { requestId, code: error.code });
      const schemaNotReady = error.code === "P2021" || error.code === "P2022";
      return NextResponse.json(
        {
          error: schemaNotReady ? "Esquema no inicializado" : "Error de base de datos",
          ...(isProd ? {} : { details: `${error.code}`, hint: schemaNotReady ? "Ejecuta: prisma db push (o prisma migrate dev)" : undefined }),
        },
        { status: schemaNotReady ? 503 : 500, headers: corsHeaders }
      );
    }

    if (error instanceof Error && /POSTGRES_URL|DATABASE_URL/i.test(error.message)) {
      console.error("[auth.register.db_env_missing]", { requestId, message: error.message });
      return NextResponse.json(
        {
          error: "Configuración de base de datos incompleta",
          ...(isProd ? {} : { details: error.message }),
        },
        { status: 503, headers: corsHeaders }
      );
    }

    console.error('[auth.register.error]', { requestId, error });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
}
