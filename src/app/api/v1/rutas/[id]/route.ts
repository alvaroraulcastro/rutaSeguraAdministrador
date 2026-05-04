import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { actualizarRutaSchema } from '@/lib/schemas/ruta';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const ruta = await prisma.ruta.findUnique({
      where: { id },
      include: {
        transportista: true,
        paradas: { include: { pasajero: true }, orderBy: { orden: 'asc' } },
      },
    });

    if (!ruta || (usuario.rol !== 'ADMIN' && ruta.transportistaId !== usuario.id)) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(ruta, { headers: corsHeaders });

  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json({ error: 'Error al obtener la ruta' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    if (usuario.rol !== 'TRANSPORTISTA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403, headers: corsHeaders });
    }

    const rutaExistente = await prisma.ruta.findFirst({
      where: { id, transportistaId: usuario.id },
      select: { id: true },
    });
    if (!rutaExistente) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
    }

    const data = await request.json();
    const validatedData = actualizarRutaSchema.parse(data);

    const rutaActualizada = await prisma.ruta.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(rutaActualizada, { headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    // Manejar error si la ruta no existe
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
      }
    }
    console.error('Error updating route:', error);
    return NextResponse.json({ error: 'Error al actualizar la ruta' }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    if (usuario.rol !== 'TRANSPORTISTA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403, headers: corsHeaders });
    }

    const rutaExistente = await prisma.ruta.findFirst({
      where: { id, transportistaId: usuario.id },
      select: { id: true },
    });
    if (!rutaExistente) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
    }

    const viajes = await prisma.viaje.findMany({
      where: { rutaId: id },
      select: { id: true },
    });
    const viajeIds = viajes.map((v) => v.id);

    await prisma.$transaction([
      prisma.notificacionLog.deleteMany({
        where: { viajeId: { in: viajeIds } },
      }),
      prisma.viaje.deleteMany({
        where: { rutaId: id },
      }),
      prisma.parada.deleteMany({
        where: { rutaId: id },
      }),
      prisma.ruta.delete({
        where: { id },
      }),
    ]);

    return new NextResponse(null, { status: 204, headers: corsHeaders }); // No Content

  } catch (error) {
    // Manejar error si la ruta no existe
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'No se puede eliminar la ruta porque tiene registros asociados' },
          { status: 409, headers: corsHeaders }
        );
      }
    }
    console.error('Error deleting route:', error);
    return NextResponse.json({ error: 'Error al eliminar la ruta' }, { status: 500, headers: corsHeaders });
  }
}
