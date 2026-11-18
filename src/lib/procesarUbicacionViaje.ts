import { TipoRuta } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { distanciaMetros } from '@/lib/geo';
import { registrarYEnviarNotificacion, TIPOS_NOTIFICACION } from '@/lib/notificaciones';

const UMBRAL_EN_CAMINO_METROS = 400;
const UMBRAL_EN_PUERTA_METROS = 80;

function coordsParada(
  tipoRuta: TipoRuta,
  parada: {
    pasajero: {
      latDomicilio: number;
      lngDomicilio: number;
      latDestino: number;
      lngDestino: number;
      nombre: string;
    };
  }
): { lat: number; lng: number; etiqueta: string } {
  if (tipoRuta === TipoRuta.VUELTA) {
    return {
      lat: parada.pasajero.latDestino,
      lng: parada.pasajero.lngDestino,
      etiqueta: parada.pasajero.nombre,
    };
  }
  return {
    lat: parada.pasajero.latDomicilio,
    lng: parada.pasajero.lngDomicilio,
    etiqueta: parada.pasajero.nombre,
  };
}

export interface ResultadoUbicacionViaje {
  distanciaProximaParadaMetros: number | null;
  paradaActualOrden: number;
  notificacionesNuevas: number;
  viajeCompletado: boolean;
}

export async function procesarUbicacionViaje(
  viajeId: string,
  lat: number,
  lng: number
): Promise<ResultadoUbicacionViaje> {
  const viaje = await prisma.viaje.findFirst({
    where: { id: viajeId, estado: 'EN_CURSO' },
    include: {
      ruta: {
        include: {
          paradas: {
            include: {
              pasajero: {
                include: { contactos: true },
              },
            },
            orderBy: { orden: 'asc' },
          },
        },
      },
    },
  });

  if (!viaje) {
    throw new Error('VIAJE_NO_EN_CURSO');
  }

  let paradaActualOrden = viaje.paradaActualOrden;
  let notificacionesNuevas = 0;
  let viajeCompletado = false;
  let distanciaProximaParadaMetros: number | null = null;

  const paradaActual = viaje.ruta.paradas.find((p) => p.orden === paradaActualOrden);

  if (paradaActual) {
    const destino = coordsParada(viaje.ruta.tipo, paradaActual);
    const distancia = distanciaMetros(lat, lng, destino.lat, destino.lng);
    distanciaProximaParadaMetros = Math.round(distancia);

    const contactos =
      paradaActual.pasajero.contactos.length > 0
        ? paradaActual.pasajero.contactos
        : [
            {
              nombre: paradaActual.pasajero.nombre,
              telefono: paradaActual.pasajero.telefono,
              canal: 'PUSH' as const,
            },
          ];

    if (distancia <= UMBRAL_EN_CAMINO_METROS) {
      const mensaje = `El transporte se acerca al domicilio de ${destino.etiqueta} (aprox. ${Math.round(distancia)} m).`;
      for (const c of contactos) {
        const r = await registrarYEnviarNotificacion({
          viajeId,
          pasajeroId: paradaActual.pasajeroId,
          tipo: TIPOS_NOTIFICACION.EN_CAMINO,
          mensaje,
          canal: c.canal,
          destinatario: c.nombre,
        });
        if (r.creada) notificacionesNuevas += 1;
      }
    }

    if (distancia <= UMBRAL_EN_PUERTA_METROS) {
      const mensaje = `El transporte ha llegado al punto de recogida de ${destino.etiqueta}.`;
      for (const c of contactos) {
        const r = await registrarYEnviarNotificacion({
          viajeId,
          pasajeroId: paradaActual.pasajeroId,
          tipo: TIPOS_NOTIFICACION.EN_PUERTA,
          mensaje,
          canal: c.canal,
          destinatario: c.nombre,
        });
        if (r.creada) notificacionesNuevas += 1;
      }

      const siguienteOrden = paradaActualOrden + 1;
      const haySiguiente = viaje.ruta.paradas.some((p) => p.orden === siguienteOrden);
      if (haySiguiente) {
        paradaActualOrden = siguienteOrden;
      } else {
        viajeCompletado = true;
      }
    }
  }

  await prisma.viaje.update({
    where: { id: viajeId },
    data: {
      ultimaLat: lat,
      ultimaLng: lng,
      ultimaUbicacionEn: new Date(),
      paradaActualOrden,
      ...(viajeCompletado ? { estado: 'COMPLETADO' as const } : {}),
    },
  });

  return {
    distanciaProximaParadaMetros,
    paradaActualOrden,
    notificacionesNuevas,
    viajeCompletado,
  };
}