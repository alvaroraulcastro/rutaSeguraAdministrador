/** Umbrales GPS y toggles operativos (env). */
export function getUmbralesGps() {
  return {
    enCaminoMetros: parseInt(process.env.GPS_UMBRAL_EN_CAMINO_METROS ?? '400', 10),
    enPuertaMetros: parseInt(process.env.GPS_UMBRAL_EN_PUERTA_METROS ?? '80', 10),
  };
}

export function notificacionesPushHabilitadas(): boolean {
  return Boolean(process.env.FCM_SERVER_KEY?.trim());
}