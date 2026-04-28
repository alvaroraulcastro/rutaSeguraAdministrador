import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { actualizarPasajeroSchema } from '@/lib/schemas/pasajero';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const pasajero = await prisma.pasajero.findFirst({
      where: { 
        id,
        transportistaId: usuario.id,
      },
      include: { contactos: true },
    });

    if (!pasajero) {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(pasajero, { headers: corsHeaders });

  } catch (error) {
    console.error('Error fetching passenger:', error);
    return NextResponse.json({ error: 'Error al obtener el pasajero' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const data = await request.json();
    const { contactos, ...pasajeroData } = actualizarPasajeroSchema.parse(data);

    // Verificar que el pasajero pertenezca al transportista
    const pasajeroExistente = await prisma.pasajero.findFirst({
      where: { id, transportistaId: usuario.id }
    });

    if (!pasajeroExistente) {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404, headers: corsHeaders });
    }

    const pasajeroActualizado = await prisma.pasajero.update({
      where: { id },
      data: {
        ...pasajeroData,
        ...(contactos && { contactos: { deleteMany: {}, create: contactos } }),
      },
      include: { contactos: true },
    });

    return NextResponse.json(pasajeroActualizado, { headers: corsHeaders });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404, headers: corsHeaders });
      }
    }
    console.error('Error updating passenger:', error);
    return NextResponse.json({ error: 'Error al actualizar el pasajero' }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    // Verificar que el pasajero pertenezca al transportista
    const pasajeroExistente = await prisma.pasajero.findFirst({
      where: { id, transportistaId: usuario.id }
    });

    if (!pasajeroExistente) {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404, headers: corsHeaders });
    }

    await prisma.pasajero.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204, headers: corsHeaders });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404, headers: corsHeaders });
      }
    }
    console.error('Error deleting passenger:', error);
    return NextResponse.json({ error: 'Error al eliminar el pasajero' }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id } = await context.params;
    const apiKey = getApiKeyFromRequest(request);
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const body = await request.json();
    const { activo } = z.object({ activo: z.boolean() }).parse(body);

    const pasajeroExistente = await prisma.pasajero.findFirst({
      where: { id, transportistaId: usuario.id },
      select: { id: true },
    });

    if (!pasajeroExistente) {
      return NextResponse.json({ error: 'Pasajero no encontrado' }, { status: 404, headers: corsHeaders });
    }

    const pasajeroActualizado = await prisma.pasajero.update({
      where: { id },
      data: { activo },
      include: { contactos: true },
    });

    return NextResponse.json(pasajeroActualizado, { headers: corsHeaders });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    console.error('Error patching passenger:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado del pasajero' }, { status: 500, headers: corsHeaders });
  }
}
