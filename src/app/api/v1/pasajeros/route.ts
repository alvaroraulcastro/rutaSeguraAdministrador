import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearPasajeroSchema } from '@/lib/schemas/pasajero';
import { validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const pasajeros = await prisma.pasajero.findMany({
      where: {
        transportistaId: usuario.id,
      },
      include: {
        contactos: true,
      },
    });
    return NextResponse.json(pasajeros, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching passengers:', error);
    return NextResponse.json({ error: 'Error al obtener los pasajeros' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const data = await request.json();
    const { contactos, ...pasajeroData } = crearPasajeroSchema.parse(data);

    const nuevoPasajero = await prisma.pasajero.create({
      data: {
        ...pasajeroData,
        transportistaId: usuario.id,
        contactos: {
          create: contactos,
        },
      },
      include: {
        contactos: true,
      },
    });

    return NextResponse.json(nuevoPasajero, { status: 201, headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error(error);
    return NextResponse.json({ error: 'Error al crear el pasajero' }, { status: 500, headers: corsHeaders });
  }
}
