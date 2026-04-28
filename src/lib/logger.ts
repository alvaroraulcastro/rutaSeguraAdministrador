import { prisma } from './prisma';

interface LogData {
  metodo: string;
  endpoint: string;
  ip?: string | null;
  userAgent?: string | null;
  payload?: unknown;
  respuesta?: unknown;
  statusCode?: number;
  usuarioId?: string | null;
}

export async function registrarLog(data: LogData) {
  try {
    // Sanitizar payload para no guardar contraseñas en texto plano
    const payloadSanitizado: unknown =
      data.payload && typeof data.payload === 'object' && data.payload !== null
        ? { ...(data.payload as Record<string, unknown>) }
        : data.payload ?? null;

    if (payloadSanitizado && typeof payloadSanitizado === 'object') {
      const p = payloadSanitizado as Record<string, unknown>;
      if ('password' in p) p.password = '********';
      if ('newPassword' in p) p.newPassword = '********';
    }

    await prisma.logPeticion.create({
      data: {
        metodo: data.metodo,
        endpoint: data.endpoint,
        ip: data.ip,
        userAgent: data.userAgent,
        payload: payloadSanitizado !== null ? JSON.stringify(payloadSanitizado) : null,
        respuesta: data.respuesta !== undefined ? JSON.stringify(data.respuesta) : null,
        statusCode: data.statusCode,
        usuarioId: data.usuarioId,
      },
    });
  } catch (error) {
    // No queremos que un error en el log detenga la ejecución principal
    console.error('[registrarLog.error]', error);
  }
}
