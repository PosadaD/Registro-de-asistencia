// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambia-en-produccion'
);

// Rutas que no requieren autenticación
const publicRoutes = [
  '/login',
  '/checker',                    
  '/api/attendance/recognize',   
];

// Rutas solo para ADMIN
const adminRoutes = ['/dashboard'];

// Rutas para VIEWER (y ADMIN)
const viewerRoutes = ['/attendance', '/api/attendance'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir rutas públicas sin autenticación
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Obtener token de la cookie
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    // Para rutas de API que no son públicas, devolver JSON de error
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    // Para páginas, redirigir a login
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role as string;
    
    // ✅ Verificar acceso a rutas de ADMIN
    if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/attendance', request.url));
    }
    
    // ✅ Para rutas VIEWER, cualquier usuario autenticado (ADMIN o VIEWER) puede acceder
    // No hay restricción adicional, así que permitimos el acceso
    return NextResponse.next();
    
  } catch (error) {
    // Token inválido
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/attendance/:path*',
    '/checker/:path*',          
    '/api/users/:path*',
    '/api/employees/:path*',
    '/api/attendance/:path*',  
  ],
};