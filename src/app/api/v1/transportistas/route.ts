import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const transportistas = await prisma.usuario.findMany({
      where: {
        rol: 'TRANSPORTISTA',
      },
    });
    return NextResponse.json(transportistas, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Error al obtener los transportistas' }, { status: 500, headers: corsHeaders });
  }
}
