import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearParadaSchema, reordenarParadasSchema } from '@/lib/schemas/parada';
import { validarApiKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: { params: Promise<{ rutaId: string }> }) {
  try {
    const { rutaId } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
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

export async function POST(request: NextRequest, context: { params: Promise<{ rutaId: string }> }) {
  try {
    const { rutaId } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
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

export async function PUT(request: NextRequest, context: { params: Promise<{ rutaId: string }> }) {
  try {
    const { rutaId } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = reordenarParadasSchema.parse(data);

    // Para reordenar, ejecutamos múltiples actualizaciones en una transacción
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
