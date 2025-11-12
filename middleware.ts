import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth(async (req) => {
  const session = req.auth

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session?.user?.id || session.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protect checkout route
  if (req.nextUrl.pathname === "/checkout") {
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/checkout/:path*", "/orders/:path*"],
}
