import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { autenticarDesdeHeaders, esAdmin, usuarioPublicSelect } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const usuario = await autenticarDesdeHeaders(request.headers);

    if (!usuario) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    if (esAdmin(usuario)) {
      const transportistas = await prisma.usuario.findMany({
        where: { rol: 'TRANSPORTISTA' },
        select: usuarioPublicSelect,
        orderBy: { nombre: 'asc' },
      });
      return NextResponse.json(transportistas);
    }

    const yo = await prisma.usuario.findUnique({
      where: { id: usuario.id },
      select: usuarioPublicSelect,
    });

    return NextResponse.json(yo ? [yo] : []);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Error al obtener los transportistas' }, { status: 500 });
  }
}
