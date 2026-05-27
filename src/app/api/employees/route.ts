import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Employee from "../../../models/Employee";
import { employeeSchema } from "../../../lib/validators/employee";

function addSixMonths(date: Date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 6);
  return d;
}

export async function GET() {
  await connectDB();

  const employees = await Employee.find().sort({ createdAt: -1 });

  return NextResponse.json(employees);
}

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const parsed = employeeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const employee = await Employee.create({
    ...data,
    startDate: new Date(data.startDate),
    endDate: addSixMonths(new Date(data.startDate)),
  });

  return NextResponse.json(employee);
}