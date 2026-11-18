import { CanalNotificacion } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const TIPOS_NOTIFICACION = {
  EN_CAMINO: 'EN_CAMINO',
  EN_PUERTA: 'EN_PUERTA',
  LLEGADA_DESTINO: 'LLEGADA_DESTINO',
} as const;

type TipoNotificacion = (typeof TIPOS_NOTIFICACION)[keyof typeof TIPOS_NOTIFICACION];

interface EnviarNotificacionParams {
  viajeId: string;
  pasajeroId: string;
  tipo: TipoNotificacion;
  mensaje: string;
  canal: CanalNotificacion;
  destinatario: string;
}

/**
 * Registra la notificación y simula/envía push si hay credenciales FCM configuradas.
 * Idempotente por (viajeId, pasajeroId, tipo).
 */
export async function registrarYEnviarNotificacion(
  params: EnviarNotificacionParams
): Promise<{ creada: boolean; id?: string }> {
  const existente = await prisma.notificacionLog.findFirst({
    where: {
      viajeId: params.viajeId,
      pasajeroId: params.pasajeroId,
      tipo: params.tipo,
      destinatario: params.destinatario,
    },
  });

  if (existente) {
    return { creada: false };
  }

  let estado = 'ENVIADO';
  const fcmKey = process.env.FCM_SERVER_KEY;

  if (params.canal === 'PUSH') {
    if (fcmKey) {
      try {
        // Punto de integración FCM legacy (sustituir por HTTP v1 cuando haya service account).
        console.info('[notificaciones.fcm]', {
          destinatario: params.destinatario,
          tipo: params.tipo,
          mensaje: params.mensaje,
        });
      } catch (err) {
        console.error('[notificaciones.fcm.error]', err);
        estado = 'FALLIDO';
      }
    } else {
      console.info('[notificaciones.mock]', params);
    }
  } else {
    console.info('[notificaciones.canal_pendiente]', params);
  }

  const registro = await prisma.notificacionLog.create({
    data: {
      viajeId: params.viajeId,
      pasajeroId: params.pasajeroId,
      tipo: params.tipo,
      mensaje: params.mensaje,
      canal: params.canal,
      destinatario: params.destinatario,
      estado,
    },
  });

  return { creada: true, id: registro.id };
}