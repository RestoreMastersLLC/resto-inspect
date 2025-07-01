import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@/types";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Check if user is authenticated
  if (!token) {
    // Redirect to login for protected routes
    if (
      path.startsWith("/dashboard") ||
      path.startsWith("/inspection") ||
      path.startsWith("/admin") ||
      path.startsWith("/api/inspections") ||
      path.startsWith("/api/admin")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Admin-only routes
  if (path.startsWith("/admin") && token.role !== UserRole.ADMIN) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Inspector and admin routes
  if (
    (path.startsWith("/inspection") || path.startsWith("/dashboard")) &&
    token.role !== UserRole.INSPECTOR &&
    token.role !== UserRole.ADMIN
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // API route protection
  if (path.startsWith("/api/admin") && token.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (path.startsWith("/api/inspections") && token.role !== UserRole.INSPECTOR && token.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inspection/:path*",
    "/submissions/:path*",
    "/admin/:path*",
    "/api/inspections/:path*",
    "/api/submissions/:path*",
    "/api/admin/:path*",
  ],
};
