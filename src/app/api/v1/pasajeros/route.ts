import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearPasajeroSchema } from '@/lib/schemas/pasajero';

export async function GET() {
  try {
    const pasajeros = await prisma.pasajero.findMany({
      include: {
        contactos: true,
      },
    });
    return NextResponse.json(pasajeros);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los pasajeros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { contactos, ...pasajeroData } = crearPasajeroSchema.parse(data);

    const nuevoPasajero = await prisma.pasajero.create({
      data: {
        ...pasajeroData,
        contactos: {
          create: contactos,
        },
      },
      include: {
        contactos: true,
      },
    });

    return NextResponse.json(nuevoPasajero, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear el pasajero' }, { status: 500 });
  }
}
