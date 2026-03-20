import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  nombre: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  telefono: z.string(),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedData = registerSchema.parse(data);

    const existingUser = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está en uso' }, { status: 400 });
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
    console.log('New user sensitive data removed:', { _password: !!_password, _hashedApiKey: !!_hashedApiKey });

    return NextResponse.json({ user: userWithoutSensitiveData, apiKey: apiKey }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
