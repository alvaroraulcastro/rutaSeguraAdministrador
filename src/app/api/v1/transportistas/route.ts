import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
