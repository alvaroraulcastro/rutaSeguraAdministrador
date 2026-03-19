import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

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

    // En un login tradicional, aquí se generaría un JWT.
    // Con API Keys, el cliente ya debería tener su clave.
    // Este endpoint puede servir para validar credenciales y quizás devolver
    // información del usuario, pero no una nueva API Key en cada login.

    const { password, apiKey, ...userWithoutSensitiveData } = user;

    return NextResponse.json({ user: userWithoutSensitiveData });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
