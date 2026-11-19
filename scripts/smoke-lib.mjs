/** Pruebas rápidas de libs puras (sin DB). */
import assert from 'node:assert/strict';

process.env.GPS_UMBRAL_EN_CAMINO_METROS = '500';
const { getUmbralesGps } = await import('../src/lib/configOperativa.ts');
const u = getUmbralesGps();
assert.equal(u.enCaminoMetros, 500);
assert.equal(u.enPuertaMetros, 80);

const { esMismoDiaChile, hoyChileYmd } = await import('../src/lib/fechaChile.ts');
const hoy = hoyChileYmd();
assert.match(hoy, /^\d{4}-\d{2}-\d{2}$/);
assert.equal(esMismoDiaChile(new Date('2026-03-20T15:00:00.000Z'), '2026-03-20'), true);

const { mensajeNotificacion } = await import('../src/lib/plantillasNotificacion.ts');
const msg = mensajeNotificacion('EN_CAMINO', 'Ana', { metros: 120 });
assert.ok(msg.includes('Ana') && msg.includes('120'));

const { ubicacionPermitida } = await import('../src/lib/rateLimitUbicacion.ts');
const id = 'viaje-test-' + Date.now();
assert.equal(ubicacionPermitida(id), true);
assert.equal(ubicacionPermitida(id), false);

console.log('smoke-lib: OK');