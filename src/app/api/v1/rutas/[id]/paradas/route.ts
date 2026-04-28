import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearParadaSchema, reordenarParadasSchema } from '@/lib/schemas/parada';
import { autenticarDesdeHeaders, esAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rutaId } = await context.params;
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

    const paradas = await prisma.parada.findMany({
      where: { rutaId },
      orderBy: { orden: 'asc' },
      include: { pasajero: true },
    });
    return NextResponse.json(paradas);
  } catch (error) {
    console.error('Error fetching stops:', error);
    return NextResponse.json({ error: 'Error al obtener las paradas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rutaId } = await context.params;
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

    const data = await request.json();
    const validatedData = crearParadaSchema.parse(data);

    const nuevaParada = await prisma.parada.create({
      data: {
        rutaId,
        ...validatedData,
      },
    });

    return NextResponse.json(nuevaParada, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating stop:', error);
    return NextResponse.json({ error: 'Error al crear la parada' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rutaId } = await context.params;
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

    const data = await request.json();
    const validatedData = reordenarParadasSchema.parse(data);

    const transaccion = validatedData.map(parada =>
      prisma.parada.update({
        where: { id: parada.id, rutaId },
        data: { orden: parada.orden },
      })
    );

    await prisma.$transaction(transaccion);

    return NextResponse.json({ message: 'Paradas reordenadas con éxito' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error reordering stops:', error);
    return NextResponse.json({ error: 'Error al reordenar las paradas' }, { status: 500 });
  }
}
