import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validarApiKey } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    const usuario = await validarApiKey(apiKey);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    const transportistas = await prisma.usuario.findMany({
      where: {
        rol: 'TRANSPORTISTA',
      },
    });
    return NextResponse.json(transportistas);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener los transportistas' }, { status: 500 });
  }
}
