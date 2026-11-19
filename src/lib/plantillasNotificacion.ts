import type { TipoNotificacion } from '@/lib/tiposNotificacion';

export function tituloNotificacion(tipo: TipoNotificacion): string {
  switch (tipo) {
    case 'EN_CAMINO':
      return 'Transporte en camino';
    case 'EN_PUERTA':
      return 'Transporte en tu puerta';
    case 'LLEGADA_DESTINO':
      return 'Llegada al destino';
    default:
      return 'RutaSegura';
  }
}

export function mensajeNotificacion(
  tipo: TipoNotificacion,
  pasajeroNombre: string,
  contexto: { metros?: number; destinoNombre?: string }
): string {
  switch (tipo) {
    case 'EN_CAMINO':
      return `El transporte se acerca a ${pasajeroNombre} (aprox. ${contexto.metros ?? '?'} m).`;
    case 'EN_PUERTA':
      return `El transporte ha llegado al punto de recogida de ${pasajeroNombre}.`;
    case 'LLEGADA_DESTINO':
      return `${pasajeroNombre} ha llegado a ${contexto.destinoNombre ?? 'su destino'}.`;
    default:
      return `Actualización de viaje para ${pasajeroNombre}.`;
  }
}