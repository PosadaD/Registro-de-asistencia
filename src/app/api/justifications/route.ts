import { NextResponse } from "next/server";

import { connectDB } from "@/src/lib/db";

import Justification from "@/src/models/Justification";
import Attendance from "@/src/models/Attendance";
import Employee from "@/src/models/Employee";

export async function GET() {
  await connectDB();

  const justifications =
    await Justification.find()
      .populate("employeeId")
      .sort({ createdAt: -1 });

  return NextResponse.json(justifications);
}

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const {
    employeeId,
    attendanceId,
    type,
    reason,
    fileUrl,
  } = body;

  let justifiedHours = false;

  // reglas
  if (type === "HEALTH") {
    justifiedHours = true;
  }

  const justification =
    await Justification.create({
      employeeId,
      attendanceId,
      type,
      reason,
      justifiedDay: true,
      justifiedHours,
      fileUrl,
    });

  // actualizar asistencia
  const attendance =
    await Attendance.findById(attendanceId);

  if (attendance) {
    attendance.justified = true;
    attendance.isAbsent = false;

    if (justifiedHours) {
      attendance.workedHours = 4;
    }

    await attendance.save();
  }

  // descontar falta
  const employee =
    await Employee.findById(employeeId);

  if (
    employee &&
    employee.absenceCount > 0
  ) {
    employee.absenceCount -= 1;

    await employee.save();
  }

  return NextResponse.json(justification);
}