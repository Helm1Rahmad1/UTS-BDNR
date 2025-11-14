import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protect checkout route
  if (req.nextUrl.pathname === "/checkout") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout/:path*", "/orders/:path*"],
}
