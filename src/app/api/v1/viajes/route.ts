import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { crearViajeSchema } from '@/lib/schemas/viaje';
import { autenticarDesdeHeaders, esAdmin, usuarioPublicSelect } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const where = esAdmin(usuario) ? {} : { ruta: { transportistaId: usuario.id } };

    const viajes = await prisma.viaje.findMany({
      where,
      include: {
        ruta: {
          include: {
            transportista: { select: usuarioPublicSelect },
            paradas: { include: { pasajero: true } },
          },
        },
        notificaciones: true,
      },
      orderBy: {
        fecha: 'desc',
      },
    });
    return NextResponse.json(viajes);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Error al obtener los viajes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = crearViajeSchema.parse(data);

    if (!esAdmin(usuario)) {
      const ruta = await prisma.ruta.findFirst({
        where: { id: validatedData.rutaId, transportistaId: usuario.id },
        select: { id: true },
      });
      if (!ruta) {
        return NextResponse.json({ error: 'Ruta no encontrada' }, { status: 404 });
      }
    }

    const nuevoViaje = await prisma.viaje.create({
      data: {
        rutaId: validatedData.rutaId,
        fecha: validatedData.fecha ? new Date(validatedData.fecha) : new Date(),
        estado: 'PENDIENTE',
      },
    });

    return NextResponse.json(nuevoViaje, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Error al crear el viaje' }, { status: 500 });
  }
}
