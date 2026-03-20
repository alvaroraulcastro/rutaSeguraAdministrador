import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedData = loginSchema.parse(data);

    const user = await prisma.usuario.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !await bcrypt.compare(validatedData.password, user.password)) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
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
    
    return NextResponse.json({ 
      user: userWithoutSensitiveData, 
      apiKey: apiKey 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
