import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { actualizarPasajeroSchema } from '@/lib/schemas/pasajero';
import { validarApiKey } from '@/lib/auth';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const pasajero = await prisma.pasajero.findUnique({
      where: { id },
      include: { contactos: true },
    });

    if (!pasajero) {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404 });
    }

    return NextResponse.json(pasajero);

  } catch (error) {
    console.error('Error fetching passenger:', error);
    return NextResponse.json({ error: 'Error al obtener el pasajero' }, { status: 500 });
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
    const { contactos, ...pasajeroData } = actualizarPasajeroSchema.parse(data);

    const pasajeroActualizado = await prisma.pasajero.update({
      where: { id },
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404 });
      }
    }
    console.error('Error updating passenger:', error);
    return NextResponse.json({ error: 'Error al actualizar el pasajero' }, { status: 500 });
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

    await prisma.pasajero.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404 });
      }
    }
    console.error('Error deleting passenger:', error);
    return NextResponse.json({ error: 'Error al eliminar el pasajero' }, { status: 500 });
  }
}
