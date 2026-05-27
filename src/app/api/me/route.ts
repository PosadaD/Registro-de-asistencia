import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const payload = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as { id: string };

  const user = await User.findById(payload.id);

  return NextResponse.json({ username: user.username });
}