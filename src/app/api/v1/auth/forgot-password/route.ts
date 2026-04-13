import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { getCorsHeaders } from '@/lib/cors';

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

  try {
    const data = await request.json();
    const { email } = forgotPasswordSchema.parse(data);

    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    // Por seguridad, no revelamos si el email existe o no
    if (!user) {
      console.info("[auth.forgot-password.user_not_found]", { requestId, email });
      return NextResponse.json({ 
        message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' 
      }, { headers: corsHeaders });
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

    // En un entorno real, no devolveríamos el token en la respuesta
    return NextResponse.json({ 
      message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.',
      // Solo para propósitos de desarrollo/demo devolvemos el token
      _dev_token: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    }, { headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error('[auth.forgot-password.error]', { requestId, error });
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500, headers: corsHeaders });
  }
}
