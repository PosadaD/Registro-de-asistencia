// app/api/attendance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attendance from '@/models/Attendance';

// Manejar GET requests
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');
        const employeeId = searchParams.get('employeeId');

        let query: any = {};

        if (startDateParam && endDateParam) {
            // Separa la fecha (YYYY-MM-DD) de la hora (HH:MM:SS)
            const [startDate, startTime] = startDateParam.split('T');
            const [endDate, endTime] = endDateParam.split('T');
            
            const start = new Date(`${startDate}T${startTime || '00:00:00'}`);
            const end = new Date(`${endDate}T${endTime || '23:59:59'}`);
            
            query.date = {
                $gte: start,
                $lte: end
            };
        } else if (startDateParam) {
            query.date = { $gte: new Date(startDateParam) };
        } else if (endDateParam) {
            query.date = { $lte: new Date(endDateParam) };
        }

        if (employeeId && employeeId !== 'null') {
            query.employeeId = employeeId;
        }

        const attendance = await Attendance.find(query)
            .populate('employeeId', 'name rfc educationalInstitution')
            .sort({ date: -1, createdAt: -1 });

        return NextResponse.json(attendance);
    } catch (error) {
        // ... manejo de errores
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