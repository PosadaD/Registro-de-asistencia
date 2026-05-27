import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/checker"];

  const isPublic = publicRoutes.some((route) =>
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
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    const { payload } = await jwtVerify(
      token,
      secret
    );

    // SOLO ADMIN
    if (
      pathname.startsWith("/dashboard/users") &&
      payload.role !== "ADMIN"
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