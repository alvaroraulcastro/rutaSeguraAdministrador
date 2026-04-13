import { prisma } from './prisma';

interface LogData {
  metodo: string;
  endpoint: string;
  ip?: string | null;
  userAgent?: string | null;
  payload?: any;
  respuesta?: any;
  statusCode?: number;
  usuarioId?: string | null;
}

export async function registrarLog(data: LogData) {
  try {
    // Sanitizar payload para no guardar contraseñas en texto plano
    const payloadSanitizado = data.payload ? { ...data.payload } : null;
    if (payloadSanitizado && payloadSanitizado.password) {
      payloadSanitizado.password = '********';
    }
    if (payloadSanitizado && payloadSanitizado.newPassword) {
      payloadSanitizado.newPassword = '********';
    }

    await prisma.logPeticion.create({
      data: {
        metodo: data.metodo,
        endpoint: data.endpoint,
        ip: data.ip,
        userAgent: data.userAgent,
        payload: payloadSanitizado ? JSON.stringify(payloadSanitizado) : null,
        respuesta: data.respuesta ? JSON.stringify(data.respuesta) : null,
        statusCode: data.statusCode,
        usuarioId: data.usuarioId,
      },
    });
  } catch (error) {
    // No queremos que un error en el log detenga la ejecución principal
    console.error('[registrarLog.error]', error);
  }
}
