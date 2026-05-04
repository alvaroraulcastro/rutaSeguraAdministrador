import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    // Base where: solo notificaciones PUSH (FCM)
    const baseWhere: Prisma.NotificacionLogWhereInput = {
      canal: 'PUSH',
    };

    // Filtro por rol
    if (usuario.rol === 'TRANSPORTISTA') {
      baseWhere.viaje = {
        ruta: {
          transportistaId: usuario.id,
        },
      };
    }

    const total = await prisma.notificacionLog.count({
      where: baseWhere,
    });

    return NextResponse.json({ total }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error counting notifications:', error);
    return NextResponse.json({ error: 'Error al contar las notificaciones' }, { status: 500, headers: corsHeaders });
  }
}
