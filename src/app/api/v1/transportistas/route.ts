import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toUsuarioPublico, validarApiKey } from '@/lib/auth';
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

    const transportistas = await prisma.usuario.findMany({
      where: { rol: 'TRANSPORTISTA' },
      include: {
        _count: {
          select: {
            rutas: true,
          },
        },
      },
    });

    const enCursoPorTransportista = await prisma.viaje.groupBy({
      by: ['rutaId'],
      where: { estado: 'EN_CURSO' },
    });

    const rutasEnCurso = await prisma.ruta.findMany({
      where: { id: { in: enCursoPorTransportista.map((v) => v.rutaId) } },
      select: { id: true, transportistaId: true },
    });

    const transportistasEnRuta = new Set(
      rutasEnCurso.map((r) => r.transportistaId)
    );

    const payload = transportistas.map((t) => {
      const rutasAsignadas = t._count.rutas;
      const publico = toUsuarioPublico(t);
      return {
        ...publico,
        rutasAsignadas,
        estadoOperativo: transportistasEnRuta.has(t.id) ? ('En ruta' as const) : ('Disponible' as const),
      };
    });

    return NextResponse.json(payload, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Error al obtener los transportistas' }, { status: 500, headers: corsHeaders });
  }
}
