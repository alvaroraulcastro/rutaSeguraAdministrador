import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const isProd = process.env.NODE_ENV === "production";
  try {
    await prisma.$queryRaw`SELECT 1`;
    let schemaReady = true;
    try {
      await prisma.usuario.count();
    } catch (e) {
      schemaReady = false;
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          {
            ok: true,
            db: true,
            schemaReady: false,
            error: "Esquema no inicializado",
            ...(isProd ? {} : { details: e.code, hint: "Ejecuta: prisma db push (o prisma migrate dev)" }),
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        {
          ok: true,
          db: true,
          schemaReady: false,
          error: "Esquema no inicializado",
          ...(isProd ? {} : { details: String(e), hint: "Ejecuta: prisma db push (o prisma migrate dev)" }),
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, db: true, schemaReady });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        { ok: false, db: false, error: "Base de datos no disponible", ...(isProd ? {} : { details: error.message }) },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { ok: false, db: false, error: "Error verificando base de datos", ...(isProd ? {} : { details: String(error) }) },
      { status: 500 }
    );
  }
}
