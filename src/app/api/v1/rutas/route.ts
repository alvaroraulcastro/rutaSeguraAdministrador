import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearRutaSchema } from '@/lib/schemas/ruta';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const where = usuario.rol === 'ADMIN' ? {} : { transportistaId: usuario.id };
    const rutas = await prisma.ruta.findMany({
      where,
      include: {
        transportista: true,
        paradas: {
          include: {
            pasajero: true,
          },
        },
      },
    });
    return NextResponse.json(rutas, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: 'Error al obtener las rutas' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    if (usuario.rol !== 'TRANSPORTISTA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403, headers: corsHeaders });
    }

    const data = await request.json();
    const validatedData = crearRutaSchema.parse(data);

    const pasajeroIds = validatedData.pasajeroIds ?? [];
    if (pasajeroIds.length > 0) {
      const pasajeros = await prisma.pasajero.findMany({
        where: { id: { in: pasajeroIds }, transportistaId: usuario.id },
        select: { id: true },
      });
      if (pasajeros.length !== pasajeroIds.length) {
        return NextResponse.json(
          { error: 'Uno o más pasajeros no pertenecen al transportista' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    const nuevaRuta = await prisma.ruta.create({
      data: {
        nombre: validatedData.nombre,
        tipo: validatedData.tipo,
        inicioTipo: validatedData.inicioTipo,
        inicioDireccion: validatedData.inicioDireccion,
        inicioComuna: validatedData.inicioComuna,
        latInicio: validatedData.latInicio,
        lngInicio: validatedData.lngInicio,
        transportistaId: usuario.id,
        ...(pasajeroIds.length > 0
          ? {
              paradas: {
                create: pasajeroIds.map((pasajeroId, index) => ({
                  pasajeroId,
                  orden: index + 1,
                })),
              },
            }
          : {}),
      },
      include: {
        paradas: { include: { pasajero: true }, orderBy: { orden: 'asc' } },
      },
    });

    return NextResponse.json(nuevaRuta, { status: 201, headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error('Error creating route:', error);
    return NextResponse.json({ error: 'Error al crear la ruta' }, { status: 500, headers: corsHeaders });
  }
}
