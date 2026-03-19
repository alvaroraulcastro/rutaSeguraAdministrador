import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Rutas que no requieren autenticación
const publicRoutes = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Si la ruta es pública, no hacer nada
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Verificar la API Key para rutas protegidas
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'API Key no proporcionada' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // En un escenario real, buscaríamos el hash en la DB.
  // Aquí simulamos una búsqueda y comparación.
  // Esta lógica debe ser reemplazada por una búsqueda real en la base de datos.
  const users = await prisma.usuario.findMany();
  let authorized = false;

  for (const user of users) {
    if (user.apiKey && await bcrypt.compare(apiKey, user.apiKey)) {
      authorized = true;
      break;
    }
  }

  if (!authorized) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'API Key inválida' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};
