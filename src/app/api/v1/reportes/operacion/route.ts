import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

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
    const dias = Math.min(90, Math.max(1, parseInt(searchParams.get('dias') ?? '7', 10)));

    const desde = new Date();
    desde.setUTCDate(desde.getUTCDate() - dias);
    desde.setUTCHours(0, 0, 0, 0);

    const filtroRuta =
      usuario.rol === 'TRANSPORTISTA' ? { transportistaId: usuario.id } : {};

    const viajes = await prisma.viaje.findMany({
      where: {
        fecha: { gte: desde },
        ruta: filtroRuta,
      },
      select: {
        id: true,
        fecha: true,
        estado: true,
      },
    });

    const notificacionesFallidas = await prisma.notificacionLog.count({
      where: {
        enviadoEn: { gte: desde },
        estado: 'FALLIDO',
        ...(usuario.rol === 'TRANSPORTISTA'
          ? { viaje: { ruta: { transportistaId: usuario.id } } }
          : {}),
      },
    });

    const porDia = new Map<
      string,
      { totalRoutes: number; completed: number; incidents: number }
    >();

    for (const v of viajes) {
      const key = v.fecha.toISOString().slice(0, 10);
      const row = porDia.get(key) ?? { totalRoutes: 0, completed: 0, incidents: 0 };
      row.totalRoutes += 1;
      if (v.estado === 'COMPLETADO') row.completed += 1;
      if (v.estado === 'CANCELADO') row.incidents += 1;
      porDia.set(key, row);
    }

    const historial = [...porDia.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, row]) => ({
        key: date,
        date,
        totalRoutes: row.totalRoutes,
        completed: row.completed,
        incidents: row.incidents,
        punctuality:
          row.totalRoutes > 0
            ? Math.round((row.completed / row.totalRoutes) * 100)
            : 0,
      }));

    const totalViajes = viajes.length;
    const completados = viajes.filter((v) => v.estado === 'COMPLETADO').length;
    const eficiencia =
      totalViajes > 0 ? Math.round((completados / totalViajes) * 1000) / 10 : null;

    return NextResponse.json(
      {
        eficiencia,
        incidenciasMes: notificacionesFallidas,
        historial,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error reportes operacion:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500, headers: corsHeaders });
  }
}