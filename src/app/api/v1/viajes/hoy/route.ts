import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';
import { esMismoDiaChile, hoyChileYmd } from '@/lib/fechaChile';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);
    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const { searchParams } = new URL(request.url);
    const dia = searchParams.get('fecha') ?? hoyChileYmd();
    const filtroRuta =
      usuario.rol === 'TRANSPORTISTA' ? { transportistaId: usuario.id } : {};

    const candidatos = await prisma.viaje.findMany({
      where: {
        ruta: filtroRuta,
        fecha: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
      include: {
        ruta: {
          include: {
            transportista: { select: { id: true, nombre: true } },
            paradas: { include: { pasajero: true }, orderBy: { orden: 'asc' } },
          },
        },
        notificaciones: true,
      },
      orderBy: { fecha: 'desc' },
    });

    const viajes = candidatos.filter((v) => esMismoDiaChile(v.fecha, dia));

    return NextResponse.json({ fecha: dia, viajes }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error viajes hoy:', error);
    return NextResponse.json({ error: 'Error al obtener viajes del día' }, { status: 500, headers: corsHeaders });
  }
}