import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwt } from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  // rutas públicas
  const publicRoutes = [
    "/login",
    "/checker",
  ];

  const isPublic =
    publicRoutes.some((route) =>
      pathname.startsWith(route)
    );

  if (isPublic) {
    return NextResponse.next();
  }

   // no token
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  try {
    // verificar JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: string;
      role: string;
    };

    // SOLO ADMIN
    if (
      pathname.startsWith("/dashboard/users") &&
      decoded.role !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/viewer/:path*",
  ],
};