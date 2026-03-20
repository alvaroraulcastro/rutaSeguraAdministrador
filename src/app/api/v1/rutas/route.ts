import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearRutaSchema } from '@/lib/schemas/ruta';
import { validarApiKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const rutas = await prisma.ruta.findMany({
      include: {
        transportista: true,
        paradas: {
          include: {
            pasajero: true,
          },
        },
      },
    });
    return NextResponse.json(rutas);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: 'Error al obtener las rutas' }, { status: 500 });
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
    const validatedData = crearRutaSchema.parse(data);

    const nuevaRuta = await prisma.ruta.create({
      data: validatedData,
    });

    return NextResponse.json(nuevaRuta, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating route:', error);
    return NextResponse.json({ error: 'Error al crear la ruta' }, { status: 500 });
  }
}
