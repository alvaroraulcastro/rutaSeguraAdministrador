import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { locationSchema } from '@/lib/schemas/location';
import { getApiKeyFromRequest, validarApiKey } from '@/lib/auth';
import { getCorsHeaders } from '@/lib/cors';
import { procesarUbicacionViaje } from '@/lib/procesarUbicacionViaje';
import { obtenerViajeSiAutorizado } from '@/lib/viajeAutorizacion';
import { ubicacionPermitida } from '@/lib/rateLimitUbicacion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(request) });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(request);
  try {
    const { id: viajeId } = await context.params;
    const usuario = await validarApiKey(getApiKeyFromRequest(request));

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401, headers: corsHeaders });
    }

    const auth = await obtenerViajeSiAutorizado(viajeId, usuario);
    if (auth.status === 'not_found') {
      return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404, headers: corsHeaders });
    }
    if (auth.status === 'forbidden') {
      return NextResponse.json({ error: 'No autorizado para este viaje' }, { status: 403, headers: corsHeaders });
    }

    if (!ubicacionPermitida(viajeId)) {
      return NextResponse.json(
        { error: 'Demasiadas actualizaciones GPS; espera unos segundos' },
        { status: 429, headers: corsHeaders }
      );
    }

    const data = await request.json();
    const validatedData = locationSchema.parse(data);

    const resultado = await procesarUbicacionViaje(viajeId, validatedData.lat, validatedData.lng);

    return NextResponse.json(
      {
        message: 'Ubicación procesada',
        ...resultado,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400, headers: corsHeaders });
    }
    if (error instanceof Error && error.message === 'VIAJE_NO_EN_CURSO') {
      return NextResponse.json(
        { error: 'Viaje no encontrado o no está en curso' },
        { status: 404, headers: corsHeaders }
      );
    }
    console.error('Error processing location:', error);
    return NextResponse.json({ error: 'Error al procesar la ubicación' }, { status: 500, headers: corsHeaders });
  }
}