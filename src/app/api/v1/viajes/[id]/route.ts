import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { actualizarViajeSchema } from '@/lib/schemas/viaje';
import { autenticarDesdeHeaders, esAdmin, usuarioPublicSelect } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const viaje = await prisma.viaje.findFirst({
      where: esAdmin(usuario) ? { id } : { id, ruta: { transportistaId: usuario.id } },
      include: {
        ruta: { include: { transportista: { select: usuarioPublicSelect }, paradas: { include: { pasajero: true } } } },
        notificaciones: true,
      },
    });

    if (!viaje) {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
    }

    return NextResponse.json(viaje);

  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Error al obtener the viaje' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const viajeExistente = await prisma.viaje.findFirst({
      where: esAdmin(usuario) ? { id } : { id, ruta: { transportistaId: usuario.id } },
      select: { id: true },
    });

    if (!viajeExistente) {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
    }

    const data = await request.json();
    const validatedData = actualizarViajeSchema.parse(data);

    const viajeActualizado = await prisma.viaje.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(viajeActualizado);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
      }
    }
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Error al actualizar el viaje' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const viajeExistente = await prisma.viaje.findFirst({
      where: esAdmin(usuario) ? { id } : { id, ruta: { transportistaId: usuario.id } },
      select: { id: true },
    });

    if (!viajeExistente) {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
    }

    await prisma.viaje.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });
      }
    }
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Error al eliminar el viaje' }, { status: 500 });
  }
}
