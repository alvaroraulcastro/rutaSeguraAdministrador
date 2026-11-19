/** Fecha calendario YYYY-MM-DD en zona America/Santiago. */
export function hoyChileYmd(fecha = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(fecha);
}

/** ¿El instante `fecha` cae en el día calendario `ymd` en Chile? */
export function esMismoDiaChile(fecha: Date, ymd: string): boolean {
  return hoyChileYmd(fecha) === ymd;
}