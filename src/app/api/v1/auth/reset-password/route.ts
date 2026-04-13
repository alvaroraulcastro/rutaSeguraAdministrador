import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getCorsHeaders } from '@/lib/cors';

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

  try {
    const data = await request.json();
    const { email, token, newPassword } = resetPasswordSchema.parse(data);

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
      return NextResponse.json({ 
        error: 'Token inválido o expirado' 
      }, { status: 400, headers: corsHeaders });
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

    return NextResponse.json({ 
      message: 'Contraseña restablecida con éxito' 
    }, { headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error('[auth.reset-password.error]', { requestId, error });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
}
