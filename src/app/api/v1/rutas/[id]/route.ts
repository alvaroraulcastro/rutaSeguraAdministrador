import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { actualizarRutaSchema } from '@/lib/schemas/ruta';
import { validarApiKey } from '@/lib/auth';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const ruta = await prisma.ruta.findUnique({
      where: { id },
      include: {
        transportista: true,
        paradas: { include: { pasajero: true }, orderBy: { orden: 'asc' } },
      },
    });

    if (!ruta) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
    }

    return NextResponse.json(ruta);

  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json({ error: 'Error al obtener la ruta' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = actualizarRutaSchema.parse(data);

    const rutaActualizada = await prisma.ruta.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(rutaActualizada);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    // Manejar error si la ruta no existe
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
    }
    console.error('Error updating route:', error);
    return NextResponse.json({ error: 'Error al actualizar la ruta' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    await prisma.ruta.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    // Manejar error si la ruta no existe
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
    }
    console.error('Error deleting route:', error);
    return NextResponse.json({ error: 'Error al eliminar la ruta' }, { status: 500 });
  }
}
