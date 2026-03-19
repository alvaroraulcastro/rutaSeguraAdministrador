import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearViajeSchema } from '@/lib/schemas/viaje';
import { validarApiKey } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const viajes = await prisma.viaje.findMany({
      include: {
        ruta: {
          include: {
            transportista: true,
            paradas: { include: { pasajero: true } },
          },
        },
        notificaciones: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });
    return NextResponse.json(viajes);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Error al obtener los viajes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = crearViajeSchema.parse(data);

    const nuevoViaje = await prisma.viaje.create({
      data: {
        rutaId: validatedData.rutaId,
        fecha: validatedData.fecha ? new Date(validatedData.fecha) : new Date(),
        estado: 'PENDIENTE',
      },
    });

    return NextResponse.json(nuevoViaje, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Error al crear el viaje' }, { status: 500 });
  }
}
