import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prismaInstance: PrismaClient | null = null;

const prismaClientSingleton = () => {
  if (prismaInstance) return prismaInstance;

  const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL o DATABASE_URL no está configurada (Environment Variables)');
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
  return prismaInstance;
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma =
  (globalThis.prismaGlobal as PrismaClient | undefined) ??
  (new Proxy({} as PrismaClient, {
    get(_target, prop) {
      const client = prismaClientSingleton();
      return (client as any)[prop];
    },
  }) as PrismaClient);

export { prisma };

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
