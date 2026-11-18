import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function inicioDelDiaUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

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

    const esTransportista = usuario.rol === 'TRANSPORTISTA';
    const filtroRuta = esTransportista ? { transportistaId: usuario.id } : {};

    const [pasajerosTotal, rutasTotal, viajesActivos, viajesHoy, notificacionesHoy] = await Promise.all([
      prisma.pasajero.count({
        where: esTransportista ? { transportistaId: usuario.id } : undefined,
      }),
      prisma.ruta.count({ where: filtroRuta }),
      prisma.viaje.count({
        where: { estado: 'EN_CURSO', ruta: filtroRuta },
      }),
      prisma.viaje.findMany({
        where: {
          fecha: { gte: inicioDelDiaUTC() },
          ruta: filtroRuta,
        },
        include: {
          ruta: {
            include: {
              transportista: { select: { id: true, nombre: true } },
              paradas: {
                include: { pasajero: { select: { nombre: true, nombreDestino: true } } },
                orderBy: { orden: 'asc' },
              },
            },
          },
        },
        orderBy: { fecha: 'desc' },
        take: 20,
      }),
      prisma.notificacionLog.count({
        where: {
          enviadoEn: { gte: inicioDelDiaUTC() },
          ...(esTransportista
            ? { viaje: { ruta: { transportistaId: usuario.id } } }
            : {}),
        },
      }),
    ]);

    const completadosHoy = viajesHoy.filter((v) => v.estado === 'COMPLETADO').length;
    const totalHoy = viajesHoy.length;
    const cumplimiento =
      totalHoy > 0 ? Math.round((completadosHoy / totalHoy) * 1000) / 10 : null;

    const viajesEnTabla = viajesHoy.map((v) => {
      const paradaIdx = Math.max(0, v.paradaActualOrden - 1);
      const parada =
        v.ruta.paradas[paradaIdx] ?? v.ruta.paradas[v.ruta.paradas.length - 1];
      const estadoLabel: Record<string, string> = {
        EN_CURSO: 'En curso',
        COMPLETADO: 'Completada',
        PENDIENTE: 'Pendiente',
        CANCELADO: 'Cancelada',
      };
      return {
        id: v.id,
        transportista: v.ruta.transportista.nombre,
        ruta: v.ruta.nombre,
        estado: estadoLabel[v.estado] ?? v.estado,
        ultimaParada: parada
          ? `${parada.pasajero.nombre} → ${parada.pasajero.nombreDestino}`
          : '—',
        ultimaUbicacionEn: v.ultimaUbicacionEn,
      };
    });

    return NextResponse.json(
      {
        pasajerosTotal,
        rutasTotal,
        viajesActivos,
        notificacionesHoy,
        cumplimiento,
        viajesEnTabla,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error dashboard resumen:', error);
    return NextResponse.json({ error: 'Error al obtener resumen' }, { status: 500, headers: corsHeaders });
  }
}