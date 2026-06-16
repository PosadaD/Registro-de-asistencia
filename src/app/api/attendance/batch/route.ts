// app/api/attendance/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Attendance from '@/models/Attendance';
import Employee from '@/models/Employee';

// Función auxiliar para calcular diferencia en horas (decimal)
function getDurationInHours(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let hours = eh - sh;
  let mins = em - sm;
  if (mins < 0) {
    hours--;
    mins += 60;
  }
  return hours + mins / 60;
}

// Sumar horas a una hora en formato HH:MM
function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + hours * 60;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
}

export async function PUT(request: NextRequest) {
  try {
    const { ids, updates, adjustProportionally } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Se requiere un array de IDs' }, { status: 400 });
    }

    await connectDB();

    if (adjustProportionally) {
      // Obtener los registros con los datos de empleados poblados
      const records = await Attendance.find({ _id: { $in: ids } }).populate('employeeId');
      const bulkOps = [];

      for (const record of records) {
        const employee = record.employeeId as any;
        if (!employee) {
          console.warn(`Empleado no encontrado para registro ${record._id}`);
          continue;
        }

        const scheduledStart = employee.workSchedule?.startTime || '09:00';
        const actualCheckIn = record.checkIn;
        const actualCheckOut = record.checkOut;

        // Solo ajustar si existe entrada y salida real
        if (!actualCheckIn || !actualCheckOut) {
          console.warn(`Registro ${record._id} sin hora de entrada o salida, no se ajusta`);
          continue;
        }

        const actualDuration = getDurationInHours(actualCheckIn, actualCheckOut);
        const newCheckIn = scheduledStart;
        const newCheckOut = addHoursToTime(scheduledStart, actualDuration);

        bulkOps.push({
          updateOne: {
            filter: { _id: record._id },
            update: {
              $set: {
                checkIn: newCheckIn,
                checkOut: newCheckOut,
                isLate: false,
                isAbsent: false,
                workedHours: parseFloat(actualDuration.toFixed(2)),
              },
            },
          },
        });
      }

      if (bulkOps.length === 0) {
        return NextResponse.json({ success: true, modifiedCount: 0, message: 'No se pudo ajustar ningún registro' });
      }

      const result = await Attendance.bulkWrite(bulkOps);
      return NextResponse.json({
        success: true,
        modifiedCount: result.modifiedCount,
      });
    } else {
      // Actualización simple de campos (isLate, isAbsent)
      const result = await Attendance.updateMany(
        { _id: { $in: ids } },
        { $set: updates },
        { runValidators: true }
      );
      return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    }
  } catch (error) {
    console.error('Error en actualización masiva:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}