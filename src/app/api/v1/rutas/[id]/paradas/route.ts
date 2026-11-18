import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearParadaSchema, reordenarParadasSchema } from '@/lib/schemas/parada';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id: rutaId } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const ruta = await prisma.ruta.findUnique({
      where: { id: rutaId },
      select: { id: true, transportistaId: true },
    });
    if (!ruta || (usuario.rol !== 'ADMIN' && ruta.transportistaId !== usuario.id)) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
    }

    const paradas = await prisma.parada.findMany({
      where: { rutaId },
      orderBy: { orden: 'asc' },
      include: { pasajero: true },
    });
    return NextResponse.json(paradas, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching stops:', error);
    return NextResponse.json({ error: 'Error al obtener las paradas' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id: rutaId } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    if (usuario.rol !== 'TRANSPORTISTA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403, headers: corsHeaders });
    }

    const ruta = await prisma.ruta.findFirst({
      where: { id: rutaId, transportistaId: usuario.id },
      select: { id: true },
    });
    if (!ruta) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
    }

    const data = await request.json();
    const validatedData = crearParadaSchema.parse(data);

    const pasajero = await prisma.pasajero.findFirst({
      where: { id: validatedData.pasajeroId, transportistaId: usuario.id },
      select: { id: true },
    });
    if (!pasajero) {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404, headers: corsHeaders });
    }

    const nuevaParada = await prisma.parada.create({
      data: {
        rutaId,
        ...validatedData,
      },
    });

    return NextResponse.json(nuevaParada, { status: 201, headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error('Error creating stop:', error);
    return NextResponse.json({ error: 'Error al crear la parada' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id: rutaId } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    if (usuario.rol !== 'TRANSPORTISTA') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403, headers: corsHeaders });
    }

    const ruta = await prisma.ruta.findFirst({
      where: { id: rutaId, transportistaId: usuario.id },
      select: { id: true },
    });
    if (!ruta) {
      return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404, headers: corsHeaders });
    }

    const data = await request.json();
    const validatedData = reordenarParadasSchema.parse(data);

    const transaccion = validatedData.map(parada =>
      prisma.parada.update({
        where: { id: parada.id, rutaId },
        data: { orden: parada.orden },
      })
    );

    await prisma.$transaction(transaccion);

    return NextResponse.json({ message: 'Paradas reordenadas con éxito' }, { headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error('Error reordering stops:', error);
    return NextResponse.json({ error: 'Error al reordenar las paradas' }, { status: 500, headers: corsHeaders });
  }
}

