import { NextResponse } from "next/server";

import { connectDB } from "@/src/lib/db";

import Employee from "@/src/models/Employee";
import Attendance from "@/src/models/Attendance";
import Justification from "@/src/models/Justification";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const employee =
    await Employee.findById(params.id);

  const attendance =
    await Attendance.find({
      employeeId: params.id,
    }).sort({ date: -1 });

  const justifications =
    await Justification.find({
      employeeId: params.id,
    }).sort({ createdAt: -1 });

  return NextResponse.json({
    employee,
    attendance,
    justifications,
  });
}