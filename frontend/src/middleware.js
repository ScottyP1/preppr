import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Public routes → skip checks
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedRoutes = [
    "/market",
    "/account",
    "/cart",
    "/inbox",
    "/dashboard",
  ];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const token = req.cookies.get("access")?.value;

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url)); // no next param!
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/market/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    "/cart/:path*",
    "/inbox/:path*",
    "/login",
    "/signup",
  ],
};
