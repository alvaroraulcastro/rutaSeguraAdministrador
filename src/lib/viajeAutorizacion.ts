import { prisma } from '@/lib/prisma';
import type { Usuario } from '@prisma/client';

export async function obtenerViajeSiAutorizado(viajeId: string, usuario: Usuario) {
  const viaje = await prisma.viaje.findUnique({
    where: { id: viajeId },
    include: { ruta: { select: { transportistaId: true } } },
  });
  if (!viaje) return { status: 'not_found' as const };
  if (usuario.rol !== 'ADMIN' && viaje.ruta.transportistaId !== usuario.id) {
    return { status: 'forbidden' as const };
  }
  return { status: 'ok' as const, viaje };
}