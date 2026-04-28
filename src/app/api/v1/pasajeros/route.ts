import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearPasajeroSchema } from '@/lib/schemas/pasajero';
import { autenticarDesdeHeaders, esAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const where = esAdmin(usuario)
      ? {}
      : {
          OR: [
            { createdById: usuario.id },
            {
              paradas: {
                some: {
                  ruta: {
                    transportistaId: usuario.id,
                  },
                },
              },
            },
          ],
        };

    const pasajeros = await prisma.pasajero.findMany({
      where,
      include: {
        contactos: true,
      },
    });
    return NextResponse.json(pasajeros);
  } catch (error) {
    console.error('Error fetching passengers:', error);
    return NextResponse.json({ error: 'Error al obtener los pasajeros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const { contactos, ...pasajeroData } = crearPasajeroSchema.parse(data);

    const nuevoPasajero = await prisma.pasajero.create({
      data: {
        ...pasajeroData,
        ...(!esAdmin(usuario) ? { createdById: usuario.id } : {}),
        ...(contactos ? { contactos: { create: contactos } } : {}),
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
