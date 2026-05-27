import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { username, password } = body;

    // validar campos
    if (!username || !password) {
      return NextResponse.json(
        {
          error: "Usuario y contraseña requeridos",
        },
        { status: 400 }
      );
    }

    // buscar usuario
    const user = await User.findOne({
      username,
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado",
        },
        { status: 400 }
      );
    }

    // validar password
    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return NextResponse.json(
        {
          error: "Contraseña incorrecta",
        },
        { status: 400 }
      );
    }

    // generar token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    // response
    const response = NextResponse.json({
      ok: true,
    });

    // cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Error interno",
      },
      { status: 500 }
    );
  }
}