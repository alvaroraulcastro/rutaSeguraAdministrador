import { TipoRuta } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { distanciaMetros } from '@/lib/geo';
import { registrarYEnviarNotificacion, TIPOS_NOTIFICACION } from '@/lib/notificaciones';
import { getUmbralesGps } from '@/lib/configOperativa';
import { mensajeNotificacion } from '@/lib/plantillasNotificacion';

function coordsParada(
  tipoRuta: TipoRuta,
  parada: {
    pasajero: {
      latDomicilio: number;
      lngDomicilio: number;
      latDestino: number;
      lngDestino: number;
      nombre: string;
      nombreDestino: string;
    };
  }
): { lat: number; lng: number; etiqueta: string; esDestino: boolean } {
  if (tipoRuta === TipoRuta.VUELTA) {
    return {
      lat: parada.pasajero.latDestino,
      lng: parada.pasajero.lngDestino,
      etiqueta: parada.pasajero.nombre,
      esDestino: true,
    };
  }
  return {
    lat: parada.pasajero.latDomicilio,
    lng: parada.pasajero.lngDomicilio,
    etiqueta: parada.pasajero.nombre,
    esDestino: false,
  };
}

type ContactoEnvio = {
  nombre: string;
  telefono: string;
  canal: 'PUSH' | 'SMS' | 'WHATSAPP';
  fcmToken?: string | null;
};

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
  const { enCaminoMetros, enPuertaMetros } = getUmbralesGps();

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

    const contactos: ContactoEnvio[] =
      paradaActual.pasajero.contactos.length > 0
        ? paradaActual.pasajero.contactos.map((c) => ({
            nombre: c.nombre,
            telefono: c.telefono,
            canal: c.canal,
            fcmToken: c.fcmToken,
          }))
        : [
            {
              nombre: paradaActual.pasajero.nombre,
              telefono: paradaActual.pasajero.telefono,
              canal: 'PUSH' as const,
              fcmToken: null,
            },
          ];

  const enviarATodos = async (tipo: (typeof TIPOS_NOTIFICACION)[keyof typeof TIPOS_NOTIFICACION], mensaje: string) => {
      for (const c of contactos) {
        const r = await registrarYEnviarNotificacion({
          viajeId,
          pasajeroId: paradaActual.pasajeroId,
          tipo,
          mensaje,
          canal: c.canal,
          destinatario: c.nombre,
          fcmToken: c.fcmToken,
        });
        if (r.creada) notificacionesNuevas += 1;
      }
    };

    if (distancia <= enCaminoMetros) {
      const mensaje = mensajeNotificacion(TIPOS_NOTIFICACION.EN_CAMINO, destino.etiqueta, {
        metros: Math.round(distancia),
      });
      await enviarATodos(TIPOS_NOTIFICACION.EN_CAMINO, mensaje);
    }

    if (distancia <= enPuertaMetros) {
      const mensaje = mensajeNotificacion(TIPOS_NOTIFICACION.EN_PUERTA, destino.etiqueta, {});
      await enviarATodos(TIPOS_NOTIFICACION.EN_PUERTA, mensaje);

      const siguienteOrden = paradaActualOrden + 1;
      const haySiguiente = viaje.ruta.paradas.some((p) => p.orden === siguienteOrden);
      if (haySiguiente) {
        paradaActualOrden = siguienteOrden;
      } else {
        viajeCompletado = true;
        const msgDestino = mensajeNotificacion(
          TIPOS_NOTIFICACION.LLEGADA_DESTINO,
          paradaActual.pasajero.nombre,
          { destinoNombre: paradaActual.pasajero.nombreDestino }
        );
        await enviarATodos(TIPOS_NOTIFICACION.LLEGADA_DESTINO, msgDestino);
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