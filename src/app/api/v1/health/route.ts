import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.npm_package_version ??
    'local';

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      db: 'ok',
      version,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[health.db.error]', error);
    return NextResponse.json(
      { status: 'degraded', db: 'error', version, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}