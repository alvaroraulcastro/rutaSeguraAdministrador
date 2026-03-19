import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearRutaSchema } from '@/lib/schemas/ruta';

export async function GET() {
  try {
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
    return NextResponse.json({ error: 'Error al obtener las rutas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    return NextResponse.json({ error: 'Error al crear la ruta' }, { status: 500 });
  }
}
