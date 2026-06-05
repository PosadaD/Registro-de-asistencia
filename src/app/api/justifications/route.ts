// app/api/justifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Justification from '@/models/Justification';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();
    
    const { employeeId, date, type, justifiesFullDay, justifiesHours, startTime, endTime, reason, fileUrl } = body;
    
    // Verificar si el empleado existe
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    }
    
    // Buscar registro de asistencia del día
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Crear justificación
    const justification = await Justification.create({
      employeeId,
      attendanceId: attendance?._id || null,
      date: startDate,
      type,
      justifiesFullDay,
      justifiesHours: justifiesHours || false,
      startTime: justifiesHours ? startTime : null,
      endTime: justifiesHours ? endTime : null,
      reason,
      fileUrl,
      status: 'PENDING',
    });
    
    // Si la justificación es aprobada, se debería actualizar el contador de faltas
    // Por ahora queda pendiente
    
    return NextResponse.json(justification, { status: 201 });
    
  } catch (error) {
    console.error('Error al crear justificación:', error);
    return NextResponse.json({ error: 'Error al crear justificación' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    
    let query: any = {};
    if (employeeId) query.employeeId = employeeId;
    if (status) query.status = status;
    
    const justifications = await Justification.find(query)
      .populate('employeeId', 'name rfc')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(justifications);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener justificaciones' }, { status: 500 });
  }
}