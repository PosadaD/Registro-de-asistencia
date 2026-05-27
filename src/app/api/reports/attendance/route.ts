import { NextResponse } from "next/server";

import { connectDB } from "@/src/lib/db";

import Attendance from "@/src/models/Attendance";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } =
    new URL(req.url);

  const start =
    searchParams.get("start");

  const end =
    searchParams.get("end");

  const employeeId =
    searchParams.get("employeeId");

  const query: any = {};

  // rango fechas
  if (start && end) {
    query.date = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  // empleado
  if (employeeId) {
    query.employeeId = employeeId;
  }

  const records =
    await Attendance.find(query)
      .populate("employeeId")
      .sort({ date: -1 });

  return NextResponse.json(records);
}