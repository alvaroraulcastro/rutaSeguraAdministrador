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

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const pasajero = searchParams.get('pasajero');
    const limit = searchParams.get('limit');

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

    // Filtros opcionales
    if (tipo) {
      baseWhere.tipo = tipo;
    }
    if (estado) {
      baseWhere.estado = estado;
    }
    if (pasajero) {
      baseWhere.pasajero = {
        nombre: {
          contains: pasajero,
          mode: 'insensitive',
        },
      };
    }

    const notificaciones = await prisma.notificacionLog.findMany({
      where: baseWhere,
      include: {
        pasajero: true,
        viaje: {
          include: {
            ruta: {
              include: {
                transportista: true,
              },
            },
          },
        },
      },
      orderBy: {
        enviadoEn: 'desc',
      },
      take: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json(notificaciones, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error al obtener las notificaciones' }, { status: 500, headers: corsHeaders });
  }
}
