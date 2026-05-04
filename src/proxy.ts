import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
];

function hasApiKeyOrBearer(request: NextRequest): boolean {
  if (request.headers.get('X-API-Key')?.trim()) return true;
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ') && auth.slice(7).trim()) return true;
  return false;
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  if (!hasApiKeyOrBearer(request)) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: 'API Key no proporcionada. Usa el header X-API-Key o Authorization: Bearer.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};
