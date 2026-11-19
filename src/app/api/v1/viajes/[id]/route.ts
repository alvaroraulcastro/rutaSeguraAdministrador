import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { actualizarViajeSchema } from '@/lib/schemas/viaje';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';
import { obtenerViajeSiAutorizado } from '@/lib/viajeAutorizacion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const usuario = await validarApiKey(getApiKeyFromRequest(request));

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const auth = await obtenerViajeSiAutorizado(id, usuario);
    if (auth.status === 'not_found') {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404, headers: corsHeaders });
    }
    if (auth.status === 'forbidden') {
      return NextResponse.json({ error: 'No autorizado para este viaje' }, { status: 403, headers: corsHeaders });
    }

    const viaje = await prisma.viaje.findUnique({
      where: { id },
      include: {
        ruta: { include: { transportista: true, paradas: { include: { pasajero: true } } } },
        notificaciones: true,
      },
    });

    return NextResponse.json(viaje, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Error al obtener el viaje' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const usuario = await validarApiKey(getApiKeyFromRequest(request));

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const auth = await obtenerViajeSiAutorizado(id, usuario);
    if (auth.status === 'not_found') {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404, headers: corsHeaders });
    }
    if (auth.status === 'forbidden') {
      return NextResponse.json({ error: 'No autorizado para este viaje' }, { status: 403, headers: corsHeaders });
    }

    const data = await request.json();
    const validatedData = actualizarViajeSchema.parse(data);

    const viajeActualizado = await prisma.viaje.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(viajeActualizado, { headers: corsHeaders });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404, headers: corsHeaders });
      }
    }
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Error al actualizar el viaje' }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const usuario = await validarApiKey(getApiKeyFromRequest(request));

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const auth = await obtenerViajeSiAutorizado(id, usuario);
    if (auth.status === 'not_found') {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404, headers: corsHeaders });
    }
    if (auth.status === 'forbidden') {
      return NextResponse.json({ error: 'No autorizado para este viaje' }, { status: 403, headers: corsHeaders });
    }

    await prisma.viaje.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204, headers: corsHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404, headers: corsHeaders });
      }
    }
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Error al eliminar el viaje' }, { status: 500, headers: corsHeaders });
  }
}