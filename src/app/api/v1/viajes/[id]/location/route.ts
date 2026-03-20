import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { locationSchema } from '@/lib/schemas/location';
import { validarApiKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: viajeId } = await context.params;
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = locationSchema.parse(data);

    const viaje = await prisma.viaje.findFirst({
      where: {
        id: viajeId,
        estado: 'EN_CURSO',
      },
    });

    if (!viaje) {
      return NextResponse.json({ error: 'Viaje no encontrado o no está en curso' }, { status: 404 });
    }

    console.log(`Ubicación recibida para el viaje ${viajeId}:`, validatedData);

    return NextResponse.json({ message: 'Ubicación recibida' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error processing location:', error);
    return NextResponse.json({ error: 'Error al procesar la ubicación' }, { status: 500 });
  }
}

