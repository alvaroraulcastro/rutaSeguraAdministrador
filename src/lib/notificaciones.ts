import { CanalNotificacion } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { enviarFcmLegacy } from '@/lib/fcm';
import { tituloNotificacion } from '@/lib/plantillasNotificacion';
import { TIPOS_NOTIFICACION, type TipoNotificacion } from '@/lib/tiposNotificacion';

export { TIPOS_NOTIFICACION };

interface EnviarNotificacionParams {
  viajeId: string;
  pasajeroId: string;
  tipo: TipoNotificacion;
  mensaje: string;
  canal: CanalNotificacion;
  destinatario: string;
  fcmToken?: string | null;
}

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
    if (fcmKey && params.fcmToken) {
      const ok = await enviarFcmLegacy({
        serverKey: fcmKey,
        token: params.fcmToken,
        title: tituloNotificacion(params.tipo),
        body: params.mensaje,
      });
      if (!ok) estado = 'FALLIDO';
    } else if (fcmKey) {
      console.info('[notificaciones.fcm.sin_token]', {
        destinatario: params.destinatario,
        tipo: params.tipo,
      });
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