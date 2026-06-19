// app/api/attendance/mark-absences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';

export async function POST(request: NextRequest) {
  try {
    const { ids, startDate, endDate, mode } = await request.json();

    await connectDB();

    // Caso 1: IDs específicos (selección manual)
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const records = await Attendance.find({ _id: { $in: ids } });
      let updated = 0;
      for (const record of records) {
        record.isAbsent = true;
        record.isLate = false;
        record.checkIn = undefined;
        record.checkOut = undefined;
        record.workedHours = 0;
        record.method = 'system';
        await record.save();
        updated++;
      }
      return NextResponse.json({
        success: true,
        message: `Sobrescritos ${updated} registros`,
        details: { updated },
      });
    }

    // Caso 2: Rango de fechas (todos los empleados)
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Se requiere rango de fechas o IDs' }, { status: 400 });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const employees = await Employee.find({ status: 'ACTIVE' }).lean();
    if (!employees.length) {
      return NextResponse.json({ error: 'No hay empleados activos' }, { status: 404 });
    }

    const businessDays: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        businessDays.push(new Date(d));
      }
    }

    const results: { employee: string; updated: number; created: number }[] = [];

    for (const employee of employees) {
      let updated = 0;
      let created = 0;
      for (const day of businessDays) {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const existing = await Attendance.findOne({
          employeeId: employee._id,
          date: { $gte: dayStart, $lte: dayEnd },
        });

        if (existing) {
          // Sobrescribir existente
          existing.isAbsent = true;
          existing.isLate = false;
          existing.checkIn = undefined;
          existing.checkOut = undefined;
          existing.workedHours = 0;
          existing.method = 'system';
          await existing.save();
          updated++;
        } else {
          // Crear nuevo
          await Attendance.create({
            employeeId: employee._id,
            date: day,
            isAbsent: true,
            isLate: false,
            workedHours: 0,
            method: 'system',
          });
          created++;
        }
      }
      results.push({ employee: employee.name || employee._id.toString(), updated, created });
    }

    return NextResponse.json({
      success: true,
      message: `Procesados ${results.length} empleados`,
      details: results,
    });
  } catch (error) {
    console.error('Error en marcación de ausencias:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}