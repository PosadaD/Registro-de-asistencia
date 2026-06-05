// app/api/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attendance from '@/models/Attendance';

// Manejar GET requests
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');
    
    let query: any = {};
    
    // Filtro por fechas
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: start,
        $lte: end
      };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $lte: end };
    }
    
    // Filtro por empleado
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    console.log('Query:', JSON.stringify(query)); // Debug
    
    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name rfc educationalInstitution')
      .sort({ date: -1, createdAt: -1 });
    
    return NextResponse.json(attendance);
    
  } catch (error) {
    console.error('Error en GET /api/attendance:', error);
    return NextResponse.json(
      { error: 'Error al obtener asistencias', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Manejar POST requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();
    
    const attendance = await Attendance.create(body);
    return NextResponse.json(attendance, { status: 201 });
    
  } catch (error) {
    console.error('Error en POST /api/attendance:', error);
    return NextResponse.json(
      { error: 'Error al crear asistencia', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Manejar OPTIONS (para CORS si es necesario)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, POST, OPTIONS',
    },
  });
}