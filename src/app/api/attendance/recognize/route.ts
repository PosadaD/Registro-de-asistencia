// app/api/attendance/recognize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';

// Función para calcular distancia euclidiana entre dos descriptores
function euclideanDistance(descriptor1: number[], descriptor2: number[]): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error('Los descriptores deben tener la misma longitud');
  }
  
  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  return Math.sqrt(sum);
}

// Umbral de similitud (valores más bajos = más estrictos)
// 0.5 es un buen punto de equilibrio
const SIMILARITY_THRESHOLD = 0.5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { faceDescriptor } = body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json(
        { error: 'Descriptor facial no válido' },
        { status: 400 }
      );
    }

    await connectDB();

    // Buscar todos los empleados activos que tengan descriptor facial
    const employees = await Employee.find({
      status: 'ACTIVE',
      faceDescriptor: { $exists: true, $ne: null }
    });

    if (employees.length === 0) {
      return NextResponse.json(
        { error: 'No hay empleados registrados con reconocimiento facial' },
        { status: 404 }
      );
    }

    // Buscar la mejor coincidencia
    let bestMatch: any = null;
    let bestDistance = Infinity;

    for (const employee of employees) {
      if (!employee.faceDescriptor) continue;
      
      const distance = euclideanDistance(faceDescriptor, employee.faceDescriptor);
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = employee;
      }
    }

    // Verificar si la coincidencia es lo suficientemente buena
    if (!bestMatch || bestDistance > SIMILARITY_THRESHOLD) {
      return NextResponse.json(
        { error: 'Rostro no reconocido. Intenta nuevamente con mejor iluminación' },
        { status: 404 }
      );
    }

    // Obtener la fecha actual (sin hora, solo la fecha para buscar el registro del día)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar registro de asistencia del empleado hoy
    let attendance = await Attendance.findOne({
      employeeId: bestMatch._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const now = new Date();
    const currentTime = now.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    // Hora de entrada esperada (del horario del empleado)
    const expectedStartTime = bestMatch.workSchedule?.startTime || '09:00';
    const [expectedHour, expectedMinute] = expectedStartTime.split(':').map(Number);
    
    let isLate = false;
    let responseMessage = '';
    let type: 'CHECK_IN' | 'CHECK_OUT' = 'CHECK_IN';

    if (!attendance) {
      // No hay registro hoy → ES ENTRADA
      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      
      // Verificar si llegó tarde (más de 10 minutos después)
      if (currentHour > expectedHour || 
          (currentHour === expectedHour && currentMinute > expectedMinute + 10)) {
        isLate = true;
      }
      
      attendance = new Attendance({
        employeeId: bestMatch._id,
        date: new Date(),
        checkIn: currentTime,
        isLate: isLate,
        method: 'facial',
        workedHours: 0,
      });
      
      await attendance.save();
      responseMessage = isLate 
        ? `⚠️ Entrada registrada con retardo. Hora esperada: ${expectedStartTime}`
        : '✅ Entrada registrada exitosamente';
      
    } else if (attendance.checkIn && !attendance.checkOut) {
      // Ya tiene entrada pero no salida → ES SALIDA
      attendance.checkOut = currentTime;
      
      // Calcular horas trabajadas
      const [checkInHour, checkInMinute] = attendance.checkIn.split(':').map(Number);
      const [checkOutHour, checkOutMinute] = currentTime.split(':').map(Number);
      
      let workedHours = (checkOutHour - checkInHour) + (checkOutMinute - checkInMinute) / 60;
      workedHours = Math.max(0, workedHours);
      
      attendance.workedHours = Math.round(workedHours * 100) / 100;
      await attendance.save();
      
      responseMessage = `✅ Salida registrada. Total: ${attendance.workedHours} horas`;
      type = 'CHECK_OUT';
      
    } else if (attendance.checkOut) {
      // Ya tiene entrada y salida → No puede registrar más
      return NextResponse.json(
        { error: 'Ya completaste tu jornada de hoy' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: bestMatch._id,
      employeeName: bestMatch.name,
      type,
      time: now.toISOString(),
      late: isLate,
      workedHours: attendance.workedHours || 0,
      message: responseMessage
    });

  } catch (error) {
    console.error('Error en reconocimiento facial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}