// app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';

// GET /api/employees – Obtener todos los empleados
export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    // Devuelve un array directamente
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST /api/employees – Crear un nuevo empleado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    if (!body.name || !body.startDate) {
      return NextResponse.json(
        { error: 'El nombre y la fecha de inicio son obligatorios' },
        { status: 400 }
      );
    }

    // Asegurar que el horario tenga valores por defecto
    if (!body.workSchedule) {
      body.workSchedule = { startTime: '09:00', endTime: '13:00' };
    }

    const employee = await Employee.create(body);
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    return NextResponse.json(
      { error: 'Error al crear empleado' },
      { status: 500 }
    );
  }
}