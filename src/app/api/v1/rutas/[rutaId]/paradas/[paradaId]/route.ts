import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validarApiKey } from '@/lib/auth';

interface Params {
  rutaId: string;
  paradaId: string;
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    await prisma.parada.delete({
      where: {
        id: params.paradaId,
        // Aseguramos que la parada pertenezca a la ruta correcta
        rutaId: params.rutaId,
      },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Parada no encontrada en esta ruta' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al eliminar la parada' }, { status: 500 });
  }
}
