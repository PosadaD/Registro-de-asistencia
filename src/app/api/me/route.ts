// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambia-en-produccion'
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    // Verificar token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user || !user.active) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
    
  } catch (error) {
    console.error('Error verificando sesión:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}