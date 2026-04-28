import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearRutaSchema } from '@/lib/schemas/ruta';
import { autenticarDesdeHeaders, esAdmin, usuarioPublicSelect } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const where = esAdmin(usuario) ? {} : { transportistaId: usuario.id };

    const rutas = await prisma.ruta.findMany({
      where,
      include: {
        transportista: { select: usuarioPublicSelect },
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
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = crearRutaSchema.parse(data);

    const dataForCreate = (() => {
      if (esAdmin(usuario)) {
        const transportistaId = validatedData.transportistaId;
        if (!transportistaId) return null;
        return { ...validatedData, transportistaId };
      }
      return { ...validatedData, transportistaId: usuario.id };
    })();

    if (!dataForCreate) {
      return NextResponse.json({ error: 'El transportista es obligatorio' }, { status: 400 });
    }

    const nuevaRuta = await prisma.ruta.create({
      data: dataForCreate,
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
