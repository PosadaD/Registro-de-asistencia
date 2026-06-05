// middleware.ts (en la raíz del proyecto)
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambia-en-produccion'
);

// Rutas que no requieren autenticación
const publicRoutes = ['/login', '/cheker'];

// Rutas solo para ADMIN
const adminRoutes = ['/dashboard'];

// Rutas para VIEWER (y también ADMIN puede acceder)
const viewerRoutes = ['/attendance', '/api/attendance'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Obtener token de la cookie
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    // Redirigir a login si no hay token
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verificar token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role as string;
    
    // Verificar acceso a rutas de ADMIN
    if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== 'ADMIN') {
      // VIEWER no puede acceder a dashboard
      return NextResponse.redirect(new URL('/attendance', request.url));
    }
    
    // Permitir acceso
    return NextResponse.next();
    
  } catch (error) {
    // Token inválido
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/attendance/:path*',
    '/api/users/:path*',
    '/api/employees/:path*',
    '/api/attendance/:path*',
  ],
};