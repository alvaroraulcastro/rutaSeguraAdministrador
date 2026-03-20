import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { validarApiKey } from '@/lib/auth';

export async function DELETE(request: NextRequest, context: { params: Promise<{ rutaId: string; paradaId: string }> }) {
  try {
    const { rutaId, paradaId } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    await prisma.parada.delete({
      where: {
        id: paradaId,
        // Aseguramos que la parada pertenezca a la ruta correcta
        rutaId: rutaId,
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
