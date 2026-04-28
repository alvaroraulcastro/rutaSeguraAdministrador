import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { autenticarDesdeHeaders, esAdmin } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; paradaId: string }> }
) {
  try {
    const { id: rutaId, paradaId } = await context.params;
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    if (!esAdmin(usuario)) {
      const ruta = await prisma.ruta.findFirst({
        where: { id: rutaId, transportistaId: usuario.id },
        select: { id: true },
      });
      if (!ruta) {
        return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
      }
    }

    await prisma.parada.delete({
      where: {
        id: paradaId,
        rutaId,
      },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Parada no encontrada en esta ruta' }, { status: 404 });
      }
    }
    console.error('Error deleting stop:', error);
    return NextResponse.json({ error: 'Error al eliminar la parada' }, { status: 500 });
  }
}
