import { NextResponse } from "next/server";

import { connectDB } from "@/src/lib/db";

import Employee from "@/src/models/Employee";
import Attendance from "@/src/models/Attendance";
import Holiday from "@/src/models/Holiday";

import { isWeekend } from "@/src/lib/holidays";

export async function POST() {
  await connectDB();

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // fin de semana
  if (isWeekend(today)) {
    return NextResponse.json({
      message: "Fin de semana",
    });
  }

  // día festivo
  const holiday = await Holiday.findOne({
    date: today,
  });

  if (holiday) {
    return NextResponse.json({
      message: "Día festivo",
    });
  }

  // empleados activos
  const employees = await Employee.find({
    status: "ACTIVE",
  });

  const results = [];

  for (const employee of employees) {
    // asistencia del día
    const attendance =
      await Attendance.findOne({
        employeeId: employee._id,
        date: today,
      });

    // no asistió
    if (!attendance) {
      await Attendance.create({
        employeeId: employee._id,

        date: today,

        isAbsent: true,
      });

      employee.absenceCount += 1;

      employee.consecutiveAbsenceCount += 1;

      // 10 faltas
      if (employee.absenceCount >= 10) {
        employee.status = "DISMISSED";
      }

      // 3 consecutivas
      if (
        employee.consecutiveAbsenceCount >= 3
      ) {
        employee.status = "DISMISSED";
      }

      await employee.save();

      results.push({
        employee: employee.name,
        absent: true,
      });
    }

    // asistió → reset consecutivas
    else {
      employee.consecutiveAbsenceCount = 0;

      await employee.save();
    }
  }

  return NextResponse.json({
    success: true,
    results,
  });
}