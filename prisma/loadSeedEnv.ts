import { config as loadEnv } from 'dotenv';
import path from 'path';

/** Misma carga que prisma.config.ts (.env + .env.local). */
loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true });

export function requireDatabaseUrl(): string {
  const url = (process.env.POSTGRES_URL ?? process.env.DATABASE_URL)?.trim();
  if (!url) {
    console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Falta la URL de PostgreSQL (ECONNREFUSED suele deberse a esto).

  1. Copia .env.example → .env.local en la raíz del proyecto.
  2. Ajusta POSTGRES_URL con usuario, clave y base reales.
  3. Asegúrate de que PostgreSQL esté en marcha en ese host/puerto.
  4. Ejecuta: npx prisma db push
  5. Vuelve a: npx prisma db seed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    process.exit(1);
  }
  return url;
}