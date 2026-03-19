import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { actualizarViajeSchema } from '@/lib/schemas/viaje';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const viaje = await prisma.viaje.findUnique({
      where: { id: params.id },
      include: {
        ruta: { include: { transportista: true, paradas: { include: { pasajero: true } } } },
        notificaciones: true,
      },
    });

    if (!viaje) {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
    }

    return NextResponse.json(viaje);

  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el viaje' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const data = await request.json();
    const validatedData = actualizarViajeSchema.parse(data);

    const viajeActualizado = await prisma.viaje.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(viajeActualizado);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al actualizar el viaje' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    await prisma.viaje.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al eliminar el viaje' }, { status: 500 });
  }
}
