import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { locationSchema } from '@/lib/schemas/location';
import { validarApiKey } from '@/lib/auth';

interface Params {
  viajeId: string;
}

export async function POST(request: Request, { params }: { params: Params }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = locationSchema.parse(data);

    // 1. Verificar que el viaje existe y está en curso
    const viaje = await prisma.viaje.findFirst({
      where: {
        id: params.viajeId,
        estado: 'EN_CURSO',
      },
    });

    if (!viaje) {
      return NextResponse.json({ error: 'Viaje no encontrado o no está en curso' }, { status: 404 });
    }

    // 2. Aquí iría la lógica para emitir la ubicación a un servicio de real-time
    // Por ejemplo: await pusher.trigger(`viaje-${params.viajeId}`, 'update-location', validatedData);
    console.log(`Ubicación recibida para el viaje ${params.viajeId}:`, validatedData);

    // 3. Devolver una respuesta exitosa
    return NextResponse.json({ message: 'Ubicación recibida' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al procesar la ubicación' }, { status: 500 });
  }
}
