export const TIPOS_NOTIFICACION = {
  EN_CAMINO: 'EN_CAMINO',
  EN_PUERTA: 'EN_PUERTA',
  LLEGADA_DESTINO: 'LLEGADA_DESTINO',
} as const;

export type TipoNotificacion = (typeof TIPOS_NOTIFICACION)[keyof typeof TIPOS_NOTIFICACION];