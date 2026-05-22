import type { NextAuthConfig } from "next-auth"
import { NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"]

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isApi = pathname.startsWith("/api/auth")
      const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
      const isStatic = pathname.startsWith("/_next") || pathname === "/favicon.ico"

      if (isStatic || isApi || isPublic) return true

      if (!auth) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return true
    },
  },
}
