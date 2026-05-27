import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/db";
import Employee from "@/src/models/Employee";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const employee = await Employee.findById(params.id);

  return NextResponse.json(employee);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const body = await req.json();

  const updated = await Employee.findByIdAndUpdate(
    params.id,
    body,
    { new: true }
  );

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  await Employee.findByIdAndDelete(params.id);

  return NextResponse.json({ ok: true });
}