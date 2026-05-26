import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Usa apenas authConfig (sem Prisma, sem bcrypt) — Edge-safe
export default NextAuth(authConfig).auth

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
