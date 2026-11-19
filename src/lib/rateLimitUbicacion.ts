const ultimoEnvio = new Map<string, number>();
const INTERVALO_MS = 2000;

/** Limita POST location por viaje (evita spam; MVP en memoria). */
export function ubicacionPermitida(viajeId: string): boolean {
  const ahora = Date.now();
  const prev = ultimoEnvio.get(viajeId) ?? 0;
  if (ahora - prev < INTERVALO_MS) return false;
  ultimoEnvio.set(viajeId, ahora);
  return true;
}