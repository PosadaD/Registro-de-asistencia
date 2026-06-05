// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Clave secreta para JWT (debe estar en .env.local)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambia-en-produccion'
);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña requeridos' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Buscar usuario
    const user = await User.findOne({ username, active: true });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      );
    }
    
    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }
    
    // Actualizar último login
    user.lastLogin = new Date();
    user.lastIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    await user.save();
    
    // Crear token JWT
    const token = await new SignJWT({
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(JWT_SECRET);
    
    // Configurar cookie con el token
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });
    
    // Devolver información del usuario (sin contraseña)
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      redirectTo: user.role === 'ADMIN' ? '/dashboard' : '/attendance',
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}