import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { actualizarPasajeroSchema } from '@/lib/schemas/pasajero';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const pasajero = await prisma.pasajero.findUnique({
      where: { id: params.id },
      include: { contactos: true },
    });

    if (!pasajero) {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404 });
    }

    return NextResponse.json(pasajero);

  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener el pasajero' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const data = await request.json();
    const { contactos, ...pasajeroData } = actualizarPasajeroSchema.parse(data);

    const pasajeroActualizado = await prisma.pasajero.update({
      where: { id: params.id },
      data: {
        ...pasajeroData,
        ...(contactos && { contactos: { deleteMany: {}, create: contactos } }),
      },
      include: { contactos: true },
    });

    return NextResponse.json(pasajeroActualizado);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al actualizar el pasajero' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    await prisma.pasajero.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Error al eliminar el pasajero' }, { status: 500 });
  }
}
