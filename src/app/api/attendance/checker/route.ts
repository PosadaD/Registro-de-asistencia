import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";

import Employee from "../../../../models/Employee";
import Attendance from "../../../../models/Attendance";

import {
  calculateWorkedHours,
  calculateExtraHours,
  isLate,
} from "../../../../lib/attendance";

export async function POST(req: Request) {
  await connectDB();

  const { code } = await req.json();

  // buscar empleado
  const employee = await Employee.findOne({
    shortRfc: code,
  });

  if (!employee) {
    return NextResponse.json(
      { error: "Empleado no encontrado" },
      { status: 404 }
    );
  }

  if (employee.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Empleado inactivo" },
      { status: 400 }
    );
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const currentTime =
    now.toTimeString().slice(0, 5);

  // buscar asistencia hoy
  const attendance = await Attendance.findOne({
    employeeId: employee._id,
    date: today,
  });

  // ENTRADA
  if (!attendance) {
    const late = isLate(
      currentTime,
      employee.workSchedule.startTime
    );

    const created = await Attendance.create({
      employeeId: employee._id,

      date: today,

      checkIn: currentTime,

      isLate: late,
    });

    return NextResponse.json({
      type: "CHECK_IN",
      employee: employee.name,
      time: currentTime,
      late,
    });
  }

  // SALIDA
  if (attendance && !attendance.checkOut) {
    const workedHours =
      calculateWorkedHours(
        attendance.checkIn,
        currentTime
      );

    const extraHours =
      calculateExtraHours(workedHours);

    attendance.checkOut = currentTime;
    attendance.workedHours = workedHours;
    attendance.extraHours = extraHours;

    await attendance.save();

    return NextResponse.json({
      type: "CHECK_OUT",
      employee: employee.name,
      time: currentTime,
      workedHours,
      extraHours,
    });
  }

  // YA COMPLETO
  return NextResponse.json(
    {
      error: "Asistencia ya completada",
    },
    { status: 400 }
  );
}