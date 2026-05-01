import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; paradaId: string }> }
) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id: rutaId, paradaId } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    if (usuario.rol !== 'TRANSPORTISTA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403, headers: corsHeaders });
    }

    const ruta = await prisma.ruta.findFirst({
      where: { id: rutaId, transportistaId: usuario.id },
      select: { id: true },
    });
    if (!ruta) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
    }

    await prisma.parada.delete({
      where: {
        id: paradaId,
        rutaId,
      },
    });

    return new NextResponse(null, { status: 204, headers: corsHeaders });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Parada no encontrada en esta ruta' }, { status: 404, headers: corsHeaders });
      }
    }
    console.error('Error deleting stop:', error);
    return NextResponse.json({ error: 'Error al eliminar la parada' }, { status: 500, headers: corsHeaders });
  }
}

