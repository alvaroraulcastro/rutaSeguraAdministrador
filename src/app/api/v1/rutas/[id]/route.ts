import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { actualizarRutaSchema } from '@/lib/schemas/ruta';
import { validarApiKey } from '@/lib/auth';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const ruta = await prisma.ruta.findUnique({
      where: { id: params.id },
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
    return NextResponse.json({ error: 'Error al obtener la ruta' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = actualizarRutaSchema.parse(data);

    const rutaActualizada = await prisma.ruta.update({
      where: { id: params.id },
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
    return NextResponse.json({ error: 'Error al actualizar la ruta' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    await prisma.ruta.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    // Manejar error si la ruta no existe
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al eliminar la ruta' }, { status: 500 });
  }
}
