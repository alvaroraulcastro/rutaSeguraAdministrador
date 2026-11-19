/**
 * Smoke test HTTP contra entorno con BD (por defecto Vercel).
 * Uso: BASE_URL=https://... npx tsx scripts/smoke-api.mjs
 */
const base = (process.env.BASE_URL ?? 'https://ruta-segura-administrador.vercel.app').replace(/\/$/, '');

async function postJson(path, body, headers = {}) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${path} ${res.status}: not JSON`);
  }
  return { status: res.status, json };
}

async function get(path, headers = {}) {
  const res = await fetch(`${base}${path}`, { headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${path} ${res.status}: not JSON (${text.slice(0, 80)})`);
  }
  return { status: res.status, json };
}

const { status: loginStatus, json: login } = await postJson('/api/v1/auth/login', {
  email: 'admin@rutasegura.com',
  password: 'admin123',
});
if (loginStatus !== 200 || !login.apiKey) throw new Error('login admin failed');
const key = login.apiKey;
const h = { 'X-API-Key': key };

const health = await get('/api/v1/health');
if (health.status !== 200 && health.status !== 503) throw new Error(`health ${health.status}`);

const checks = [
  ['/api/v1/dashboard/resumen', 200],
  ['/api/v1/pasajeros', 200],
  ['/api/v1/viajes', 200],
  ['/api/v1/viajes/hoy', 200],
  ['/api/v1/config/operativa', 200],
];

for (const [path, expect] of checks) {
  const r = await get(path, h);
  if (r.status !== expect) throw new Error(`${path} expected ${expect} got ${r.status}`);
}

console.log('smoke-api: OK', { base, health: health.json.status });