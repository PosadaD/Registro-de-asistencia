import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  await connectDB();

  const exists = await User.findOne({ username: "admin" });

  if (exists) {
    return Response.json({ message: "Ya existe" });
  }

  const password = await bcrypt.hash("admin123", 10);

  await User.create({
    username: "admin",
    password,
    role: "ADMIN",
  });

  return Response.json({
    message: "Usuario creado",
    user: "admin",
    pass: "admin123",
  });
}